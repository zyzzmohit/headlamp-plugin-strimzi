# Headlamp Strimzi Plugin

[![Apache 2.0 License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-231F20?logo=apachekafka&logoColor=white)](https://kafka.apache.org)

A **Headlamp plugin** for managing [Strimzi](https://strimzi.io/) Kafka clusters on Kubernetes. This plugin provides a user-friendly interface to view and manage Kafka clusters, topics, users, and connectors directly from the Headlamp dashboard.

## ✨ Features

### 🎯 Dashboard Overview

- **Resource Statistics**: Quick view of Kafka clusters, topics, users, connects, and connectors
- **Recent Activity**: See recently created Strimzi resources
- **Quick Links**: Direct access to Strimzi documentation and GitHub

### 📊 Kafka Cluster Management

- **List View**: All Kafka clusters with status, broker count, version, and listeners
- **Detail View**: Comprehensive cluster information including:
  - Basic metadata (name, namespace, version, cluster ID)
  - Kafka configuration (replicas, storage type/size, ZooKeeper)
  - Listener configuration (name, port, type, TLS status)
  - Bootstrap servers for client connections
  - Status conditions with detailed messages

### 📝 Topic Management

- **List View**: All KafkaTopics with partitions, replicas, and status
- **Detail View**: Topic details including:
  - Partition and replication configuration
  - Custom topic configuration (retention, cleanup policy, etc.)
  - Status conditions

### 👥 User Management

- **List View**: All KafkaUsers with authentication and authorization types
- **Detail View**: User details including:
  - Authentication configuration (SCRAM-SHA, TLS, OAuth)
  - Authorization settings (ACLs, simple authorization)
  - Access Control Lists (resource type, operations, hosts)
  - Quota configuration

### 🔌 Kafka Connect

- **List View**: All KafkaConnect clusters with replicas and bootstrap servers
- **Detail View**: Connect cluster details including:
  - Connection configuration
  - Available connector plugins
  - Status conditions

### ⚡ Connectors

- **List View**: All KafkaConnectors with class, tasks, and state
- **Detail View**: Connector details including:
  - Connector configuration
  - Task status and worker assignments
  - Connector status (RUNNING, PAUSED, FAILED)

## 📋 Prerequisites

- **Headlamp** v0.20.0 or later
- **Strimzi Operator** installed in your Kubernetes cluster
- Strimzi CRDs (`kafka.strimzi.io`) deployed

## 🚀 Installation

### Option 1: Install via Headlamp Plugin Catalog

1. Open Headlamp
2. Navigate to **Settings** → **Plugins**
3. Search for "Strimzi"
4. Click **Install**

### Option 2: Manual Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/headlamp-plugin-strimzi.git
   cd headlamp-plugin-strimzi
   ```

2. Build the plugin:

   ```bash
   npm install
   npm run build
   ```

3. Copy the plugin to Headlamp's plugins directory:

   ```bash
   # Linux/macOS
   cp -r dist ~/.config/Headlamp/plugins/headlamp-plugin-strimzi/

   # Windows
   copy dist %APPDATA%\Headlamp\plugins\headlamp-plugin-strimzi\
   ```

4. Restart Headlamp

## 🛠️ Development

### Setup

```bash
# Install dependencies
npm install

# Start development server (watches for changes)
npm run start

# Run TypeScript check
npm run tsc

# Run linter
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build production bundle
npm run build

# Package for distribution
npm run package
```

### Testing with Headlamp

1. Start the plugin in development mode:

   ```bash
   npm run start
   ```

2. Start Headlamp with plugin development mode:
   ```bash
   headlamp -plugins-dir=./dist
   ```

## 📁 Project Structure

```
headlamp-plugin-strimzi/
├── src/
│   ├── index.tsx                   # Plugin entry point (routes & sidebar)
│   ├── crdClasses.ts               # Strimzi CRD class definitions
│   └── components/
│       ├── StrimziOverview.tsx     # Dashboard overview with stats
│       ├── KafkaList.tsx           # Kafka clusters list
│       ├── KafkaDetails.tsx        # Kafka cluster details
│       ├── KafkaTopicList.tsx      # Topics list
│       ├── KafkaTopicDetails.tsx   # Topic details
│       ├── KafkaUserList.tsx       # Users list
│       ├── KafkaUserDetails.tsx    # User details
│       ├── KafkaConnectList.tsx    # Connect clusters list
│       ├── KafkaConnectDetails.tsx # Connect cluster details
│       ├── KafkaConnectorList.tsx  # Connectors list
│       └── KafkaConnectorDetails.tsx # Connector details
├── dist/                           # Built plugin output
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Supported Strimzi CRDs

| CRD              | Description                          | Versions    |
| ---------------- | ------------------------------------ | ----------- |
| `Kafka`          | Kafka cluster configuration          | v1beta2, v1 |
| `KafkaTopic`     | Topic management                     | v1beta2, v1 |
| `KafkaUser`      | User authentication & authorization  | v1beta2, v1 |
| `KafkaConnect`   | Connect cluster for data integration | v1beta2, v1 |
| `KafkaConnector` | Individual connector instances       | v1beta2, v1 |

## 🗺️ Roadmap

- [ ] Create/Edit forms for resources
- [ ] KafkaBridge support
- [ ] KafkaMirrorMaker2 support
- [ ] Topic message browser
- [ ] Connector restart actions
- [ ] Metrics integration with Prometheus
- [ ] Headlamp Map view integration

## 🤝 Contributing

Contributions are welcome! Please read the [Headlamp contributing guide](https://headlamp.dev/docs/latest/contributing/) before submitting a pull request.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Headlamp](https://headlamp.dev/)
- [Strimzi - Apache Kafka on Kubernetes](https://strimzi.io/)
- [Strimzi Documentation](https://strimzi.io/documentation/)
- [Strimzi GitHub](https://github.com/strimzi/strimzi-kafka-operator)

---

**Made with ❤️ for the Kubernetes community**
