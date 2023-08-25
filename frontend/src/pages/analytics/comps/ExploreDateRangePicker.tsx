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

import {
  DateRangePicker,
  DateRangePickerProps,
} from '@cloudscape-design/components';
import i18n from 'i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface IExploreDateRangePickerProps {
  dateRangeValue: DateRangePickerProps.Value | null;
  setDateRangeValue: (value: DateRangePickerProps.Value) => void;
}

const ExploreDateRangePicker: React.FC<IExploreDateRangePickerProps> = (
  props: IExploreDateRangePickerProps
) => {
  const { dateRangeValue, setDateRangeValue } = props;
  const { t } = useTranslation();

  const isValidRange = (
    range: DateRangePickerProps.Value | null
  ): DateRangePickerProps.ValidationResult => {
    if (range?.type === 'absolute') {
      const [startDateWithoutTime] = range.startDate.split('T');
      const [endDateWithoutTime] = range.endDate.split('T');
      if (!startDateWithoutTime || !endDateWithoutTime) {
        return {
          valid: false,
          errorMessage: t('analytics:valid.dateRangeIncomplete'),
        };
      }
      if (
        new Date(range.startDate).getTime() -
          new Date(range.endDate).getTime() >
        0
      ) {
        return {
          valid: false,
          errorMessage: t('analytics:valid.dateRangeInvalid'),
        };
      }
    }
    return { valid: true };
  };

  return (
    <DateRangePicker
      onChange={({ detail }) => {
        setDateRangeValue(detail.value as DateRangePickerProps.Value);
      }}
      value={dateRangeValue ?? null}
      dateOnly
      relativeOptions={[
        {
          key: 'previous-1-day',
          amount: 1,
          unit: 'day',
          type: 'relative',
        },
        {
          key: 'previous-1-week',
          amount: 1,
          unit: 'week',
          type: 'relative',
        },
        {
          key: 'previous-2-week',
          amount: 2,
          unit: 'week',
          type: 'relative',
        },
        {
          key: 'previous-1-month',
          amount: 1,
          unit: 'month',
          type: 'relative',
        },
        {
          key: 'previous-3-months',
          amount: 3,
          unit: 'month',
          type: 'relative',
        },
        {
          key: 'previous-6-months',
          amount: 6,
          unit: 'month',
          type: 'relative',
        },
        {
          key: 'previous-1-year',
          amount: 1,
          unit: 'year',
          type: 'relative',
        },
      ]}
      isValidRange={isValidRange}
      i18nStrings={{
        relativeModeTitle: t('analytics:dateRange.relativeModeTitle') ?? '',
        absoluteModeTitle: t('analytics:dateRange.absoluteModeTitle') ?? '',
        relativeRangeSelectionHeading:
          t('analytics:dateRange.relativeRangeSelectionHeading') ?? '',
        cancelButtonLabel: t('analytics:dateRange.cancelButtonLabel') ?? '',
        applyButtonLabel: t('analytics:dateRange.applyButtonLabel') ?? '',
        clearButtonLabel: t('analytics:dateRange.clearButtonLabel') ?? '',
        customRelativeRangeOptionLabel:
          t('analytics:dateRange.customRelativeRangeOptionLabel') ?? '',
        formatRelativeRange: (value: DateRangePickerProps.RelativeValue) => {
          return `${t('analytics:dateRange.formatRelativeRangeLabel')} ${
            value.amount
          } ${i18n.t(`analytics:dateRange.${value.unit}`)}`;
        },
      }}
    />
  );
};

export default ExploreDateRangePicker;