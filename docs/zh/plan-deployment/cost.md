---
title: "成本"
weight: 1

---

!!! info "重要提示"

    以下的成本估算仅为示例，实际成本可能因环境而异。

您需要承担运行此解决方案时使用的 AWS 服务的费用。 部署此解决方案只会在您的 AWS 账户中创建一个解决方案 Web 控制台，该控制台是无服务器架构，通常AWS的免费套餐可以覆盖成本。

该解决方案的大部分成本是由数据管道产生的。 截至本次修订，影响解决方案成本的主要因素包括：

- **摄入模块**，费用取决于摄入服务器的大小和所选择的数据宿类型。

- **数据处理和建模模块**（可选），费用取决于您是否选择启用此模块以及相关配置。

- **启用的仪表板**（可选），费用取决于您是否选择启用此模块以及相关配置。

- **点击流数据的数量**

- **附加功能**

以下是以不同数据管道配置的每日数据量为10/100/1000个请求每秒（RPS）的成本估算。成本估算由模块提供。根据您的实际配置，按模块累加成本以获得您的用例的总成本。

!!! info "重要提示"

    截至本修订版，以下成本是使用`On-Demand`价格在`us-east-1`区域以美元计量的。

## 摄入模块

摄入模块包括以下成本组成部分：

- 应用程序负载均衡器
- 用于ECS的EC2实例
- 数据宿 - Data sink（Kinesis Data Streams | Kafka | 直接到S3）
- S3存储
- 数据传输出（DTO）

主要假设包括：

- 压缩后的请求有效载荷：2KB（每个请求包含10个事件）
- MSK配置（m5.large * 2）
- KDS配置（按需，预配）
- 10/100/1000 RPS

| 每日数据量/每秒请求数（RPS） | ALB 费用  | EC2 费用 |  缓冲类型（Buffer type） | 缓冲费用（Buffer cost） | S3 费用   |   总计（美元/月） |
| ------------------ | --- | ---- | ------------- | ----------- | ---  |  --------- |
| 10RPS（49GB/月）         |   $18  | $122   |  Kinesis（按需） |    $38         |   $3   |     $181  |
|                   |   $18  |  $122  |  Kinesis (预备 2 shard)   |      $22       |  $3   |     $165  |
|                   |   $18  |  $122  |  MSK (m5.large * 2, connector MCU * 1)   |       $417      |   $3  |    $560   |
|                   |   $18  |  $122  |  无缓冲              |             |  $3    |      $143   |
|100RPS（490GB/月）            |   $43 |  $122  |      Kinesis（按需）              |      $115       |  $4   |     $284 |
|                   | $43    |   $122  |  Kinesis (预备 2 shard)   |      $26       | $4    |     $195  |
|           |   $43  |  $122  |      MSK (m5.large * 2, connector MCU * 1)              |      $417       |  $4   |     $586
|           |   $43  |  $122 |      无缓冲              |             |  $4    |     $169
|1000RPS（4900GB/月）          |   $252  |   $122 |      Kinesis（按需）              |      $1051       |  $14   |    $1439 |
|                         |  $252   |  $122  |  Kinesis (预备 10 shard)   |    $180         |   $14  |     $568  |
|           |  $252   | $122  |      MSK (m5.large * 2, connector MCU * 2~3)              |      $590       |  $14  |     $978
|           |  $252   | $122 |      无缓冲              |            |  $14   |     $388


### 数据传输
当数据通过EC2发送到下游的数据宿，会产生数据的费用。下面是以1000RPS，每个请求的有效载荷为2KB为例的费用。

1. EC2 网络输入：此部分不产生费用
2. EC2 网络输出，有如下三种数据宿的情况：

    | 数据宿 | 接入数据宿方法 |  费用说明 |   总计（美元/月）|
    | ------------------ | --- | --- | ---  |  
    | S3         |  S3 Gateway endpoints | The S3 Gateway endpoints 不会产生数据传输费用   | $0  |  
    | MSK          |  |  数据传输费用（$0.010 per GB in/out/between EC2 AZs） | $210  |       
    | KDS          |  NAT |  NAT 固定费用： $64（2 Availability Zones and a NAT per AZ, $0.045 per NAT Gateway Hour）. <br> 数据传输费用：$1201（$0.045 per GB Data Processed by NAT Gateways）.  | $1266  | 
    | KDS          |  VPC Endpoint |  VPC Endpoint 固定费用：$14.62 （Availability Zones $0.01 per AZ Hour）. <br> 数据传输费用: $267($0.01 per GB Data Processed by Interface endpoints).  | $281.62  | 

    我们建议通过VPC endpoint传输数据到KDS。请参考[VPC endpoint][vpce]获取更多信息。       

## 数据处理与建模模块

如果启用数据处理与建模模块，将包括以下费用组成部分：

- EMR Serverless

- Redshift

主要假设包括：

- 10/100/1000 RPS
- 数据处理间隔：每小时/每6小时/每日
- EMR运行三个内置插件来处理数据

| 每日数据量/每秒请求数 (RPS) | EMR调度间隔 |  EMR 费用 | Redshift类型 | Redshift 费用 | 总计 (美元/月) |
| ----------------------- | --------------------- | -------- | ------------------------ | ------------- | ----- |
| 10RPS             | 每小时                |     $61（$1.24/GB）    | 无服务器 (基于8个RPU) |     $104          |   $165    |
|                         | 每6小时              |     $40.9（$0.83/GB）    | 无服务器 (基于8个RPU)               |       $16        |   $56.9    |
|                         | 每日                 |      $34.3（$0.7/GB）    | 无服务器 (基于8个RPU)               |     $11          |   $45.3    |
| 100RPS             | 每小时                |      $403（$0.82/GB）   | 无服务器 (基于8个RPU) |       $170        |  $573    |
|                         | 每6小时              |     $192（$0.39/GB）     | 无服务器 (基于8个RPU)               |       $119        |   $311    |
|                         | 每日                 |     $245（$0.5/GB）     | 无服务器 (基于8个RPU)               |       $78        |    $323   |
| 1000RPS             | 每小时                |      $2815（$0.57/GB）   | 无服务器 (基于32个RPU) |       $668        |  $3483    |
|              | 每8小时                |      $2604（$0.53/GB）   | 无服务器 (基于32个RPU) |       $359        | $2963 |

## 仪表板

如果您选择启用，仪表板模块包括以下成本组成部分：

- QuickSight

关键假设包括：

- QuickSight企业版
- 不包括Q成本
- 通过**分析工作坊**访问
- **两个作者**每月订阅
- 10GB的SPICE容量

| 每日数据量/每秒请求数 (RPS) | 作者 |  SPICE | 总计（美元/月） |
| --------------------- | ------- |  ----- | ----- |
| 所有大小              | $48      |    0    |   $48    |

!!! info "提示"
    所有数据管道都适用于以上 QuickSight 费用，即使是在解决方案之外管理的可视化内容也是如此。

## 日志和监控

方案使用CloudWatch Logs，CloudWatch Metrics和CloudWatch Dashboard来实现日志，监控，展示功能，合计费用约为每月约14美元，根据Logs的使用量和Metrics的数量会有一定浮动。

## 额外功能

只有在您选择启用以下功能时，您才会被收取额外费用。

### Secrets Manager

- 如果您启用了报告功能，该解决方案将在 Secrets Manager 中创建一个密钥，用于存储 QuickSight 可视化使用的 Redshift 凭据。**费用**：0.4 美元/月。

- 如果您启用了摄入模块的身份验证功能，您需要在 Secrets Manager 中创建一个密钥，用于存储 OIDC 的信息。**费用**：0.4 美元/月。

### Amazon全球加速器

它产生固定的按小时费用和按每日数据传输量的费用。

关键假设：

- 接入部署在`us-east-1`

| 每日数据量/RPS | 固定每小时费用 | 数据传输费用 | 总费用（美元/月） |
| --------------------- | ----------------- | ------------------ | ---------- |
| 10RPS           |        $18           |          $0.6          |       $18.6     |
| 100RPS         |          $18         |           $6         |      $24      |
| 1000RPS       |            $18       |            $60        |      $78      |

### 应用负载均衡器访问日志

您需要为 Amazon S3 的存储费用付费，但无需为 Elastic Load Balancing 用于将日志文件发送到 Amazon S3 的带宽使用付费。有关存储费用的更多信息，请参阅 [Amazon S3 定价](https://aws.amazon.com/s3/pricing/)。

| 每日数据量/RPS | 日志大小 | S3 费用（美元/月） |
| --------------------- | -------- | ------- |
| 10 RPS           |    16.5       |    $0.38     |
| 100 RPS         |     165     |      $3.8   |
| 1000 RPS       |     1650     |    $38     |

[vpce]: https://docs.aws.amazon.com/whitepapers/latest/aws-privatelink/what-are-vpc-endpoints.html