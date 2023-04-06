/**
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { Context } from 'aws-lambda';
import { logger } from '../../../common/powertools';
import { JobStatus, RedshiftMode } from '../../private/constant';
import { ServerlessRedshiftProps, ProvisionedRedshiftProps, ManifestBody } from '../../private/model';
import { getRedshiftClient, executeStatement } from '../redshift-data';

// Set the AWS Region.
const REGION = process.env.AWS_REGION; //e.g. "us-east-1"
// Create an Amazon service client object.
const ddbClient = new DynamoDBClient({ region: REGION });

const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;
const REDSHIFT_ROLE_ARN = process.env.REDSHIFT_ROLE!;
const REDSHIFT_DATA_API_ROLE_ARN = process.env.REDSHIFT_DATA_API_ROLE!;
const REDSHIFT_DATABASE = process.env.REDSHIFT_DATABASE!;
const REDSHIFT_ODS_TABLE_NAME = process.env.REDSHIFT_ODS_TABLE_NAME!;

type LoadManifestEventDetail = ManifestBody & {
  execution_id: string;
}

export interface LoadManifestEvent {
  detail: LoadManifestEventDetail;
}

const redshiftDataApiClient = getRedshiftClient(REDSHIFT_DATA_API_ROLE_ARN);

/**
 * The lambda function submit a SQL statement to load data to Redshift.
 * @param event, the JSON format is as following:
{
  execution_id: "arn:aws:states:us-east-2:xxxxxxxxxxxx:execution:LoadManifestStateMachineAE0969CA-v2ur6ASaxNOQ:12ec840c-6282-4d53-475d-6db473e539c3_70bfb836-c7d5-7cab-75b0-5222e78194ac",
  appId: "app1",
  jobList:
    {entries:
      [{
        url:"s3://DOC-EXAMPLE-BUCKET/project1/ods_external_events/partition_app=wordpuzz.wordle.puzzle.game.word.daily.free/partition_year=2023/partition_month=01/partition_day=15/clickstream-1-job_part00000.parquet.snappy",
        meta:{
          "content_length":10324001
        }
      }]
    },
  manifestFileName: "s3://DOC-EXAMPLE-BUCKET/manifest/wordpuzz.wordle.puzzle.game.word.daily.free50be34be-fdec-4b45-8b14-63c38f910a56.manifest"
}
 * @param context The context of lambda function.
 * @returns The query_id and relevant properties.
 */
export const handler = async (event: LoadManifestEvent, context: Context) => {
  logger.info('requestJson:', JSON.stringify(event, undefined, 2));
  logger.info(`context.awsRequestId:${context.awsRequestId}`);
  var appId = event.detail.appId;
  const manifestFileName = event.detail.manifestFileName;
  const jobList = event.detail.jobList;
  logger.info(`appId:${appId}, manifestFileName:${manifestFileName}, jobList:${JSON.stringify(jobList)}`);
  /**
   * The appId will be used as the schema of Redshift, '.' and '-' are not supported.
   */
  for (var i=0; i < appId.length; i++) {
    appId = appId.replace('.', '_').replace('-', '_');
  }
  logger.info(`appId:${appId}`);

  const redshiftMode = process.env.REDSHIFT_MODE!;

  var serverlessRedshiftProps: ServerlessRedshiftProps | undefined,
    provisionedRedshiftProps: ProvisionedRedshiftProps | undefined;

  if (redshiftMode == RedshiftMode.SERVERLESS) {
    serverlessRedshiftProps = {
      workgroupName: process.env.REDSHIFT_SERVERLESS_WORKGROUP_NAME!,
    };
  } else if (redshiftMode == RedshiftMode.PROVISIONED) {
    provisionedRedshiftProps = {
      dbUser: process.env.REDSHIFT_DB_USER!,
      clusterIdentifier: process.env.REDSHIFT_CLUSTER_IDENTIFIER!,
    };
  }

  for (var i=0;i < jobList.entries.length; i++) {
    await updateItem(DYNAMODB_TABLE_NAME, jobList.entries[i].url, JobStatus.JOB_PROCESSING);
  }

  const schema = appId;

  /**
   * Get table owner in Redshift, only table or database owner can analyze table:
   * SELECT n.nspname AS schema_name , pg_get_userbyid (c.relowner) AS table_owner , c.relname AS table_name ,
   * CASE WHEN c.relkind = 'v' THEN 'view' ELSE 'table' END AS table_type , d.description AS table_description
   * FROM pg_class As c LEFT JOIN pg_namespace n ON n.oid = c.relnamespace LEFT JOIN pg_tablespace t ON t.oid = c.reltablespace
   * LEFT JOIN pg_description As d ON (d.objoid = c.oid AND d.objsubid = 0)
   * WHERE c.relname='ods_events' and n.nspname NOT IN ('pg_catalog', 'information_schema') ORDER BY schema_name, table_name;
   */
  // Governs automatic computation and refresh of optimizer statistics at the end of a successful COPY command.
  const sqlStatement = `COPY ${schema}.${REDSHIFT_ODS_TABLE_NAME} FROM '${manifestFileName}' `
    + `IAM_ROLE '${REDSHIFT_ROLE_ARN}' `
    + 'STATUPDATE ON '
    + 'FORMAT AS PARQUET SERIALIZETOJSON '
    + 'MANIFEST;'
    ;

  try {
    const queryId = await executeStatement(redshiftDataApiClient, sqlStatement, REDSHIFT_DATABASE, serverlessRedshiftProps, provisionedRedshiftProps);

    logger.info('loadFileToRedshift response:', queryId);

    return {
      detail: {
        id: queryId,
        appId: appId,
        manifestFileName: manifestFileName,
        jobList: jobList,
      },
    };
  } catch (err) {
    if (err instanceof Error) {
      logger.error('Error when loading data to Redshift.', err);
    }
    throw err;
  }


};

/**
 * Function to update item to Dynamodb table.
 * @param tableName Table name in Dynamodb.
 * @param s3Uri The URI of S3 object as partition key in Dynamodb.
 * @param awsRequestId The request ID in event request body.
 * @param jobStatus The status of job.
 * @returns The response of update item.
 */
export const updateItem = async (
  tableName: string, s3Uri: string, jobStatus: string) => {
  logger.info(`updateItem: s3Uri:${s3Uri},jobStatus:${jobStatus}`);

  const params = {
    TableName: tableName,
    Key: {
      s3_uri: s3Uri,
    },
    // Define expressions for the new or updated attributes
    UpdateExpression: 'SET #job_status= :p1',
    ExpressionAttributeNames: {
      '#job_status': 'job_status',
    },
    ExpressionAttributeValues: {
      ':p1': jobStatus,
    },
  };
  try {
    const data = await ddbClient.send(new UpdateCommand(params));
    logger.info('Success - item update', data);
    return data;
  } catch (err) {
    if (err instanceof Error) {
      logger.error('Error when updating jobs in DDB.', err);
    }
    throw err;
  }
};