/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { SectionBox, SimpleTable, StatusLabel } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';

import { KafkaClass } from '../crdClasses';

function getKafkaStatus(kafka: any): { status: string; type: 'success' | 'warning' | 'error' } {
  const conditions = kafka.status?.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  
  if (readyCondition?.status === 'True') {
    return { status: 'Ready', type: 'success' };
  } else if (readyCondition?.status === 'False') {
    return { status: readyCondition.reason || 'Not Ready', type: 'error' };
  }
  return { status: 'Unknown', type: 'warning' };
}

function getBrokerCount(kafka: any): number {
  return kafka.spec?.kafka?.replicas || 0;
}

function getKafkaVersion(kafka: any): string {
  return kafka.status?.kafkaVersion || kafka.spec?.kafka?.version || 'Unknown';
}

function getListeners(kafka: any): string {
  const listeners = kafka.spec?.kafka?.listeners || [];
  return listeners.map((l: any) => l.name).join(', ') || 'None';
}

export default function KafkaList() {
  // Use the hook pattern
  const [kafkas, error] = KafkaClass.useList();

  if (error) {
    return (
      <SectionBox title="Kafka Clusters">
        <Typography color="error">Error loading Kafka clusters: {error.message || 'Unknown error'}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Make sure Strimzi CRDs are installed in your cluster.
        </Typography>
      </SectionBox>
    );
  }

  if (kafkas === null) {
    return (
      <SectionBox title="Kafka Clusters">
        <Typography>Loading Kafka clusters...</Typography>
      </SectionBox>
    );
  }

  return (
    <SectionBox title="Kafka Clusters">
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Manage your Apache Kafka clusters deployed via Strimzi operator.
        </Typography>
      </Box>

      <SimpleTable
        columns={[
          {
            label: 'Name',
            getter: (kafka: any) => (
              <Link
                component={RouterLink}
                to={`/strimzi/kafkas/${kafka.metadata?.namespace}/${kafka.metadata?.name}`}
              >
                {kafka.metadata?.name}
              </Link>
            ),
          },
          {
            label: 'Namespace',
            getter: (kafka: any) => kafka.metadata?.namespace,
          },
          {
            label: 'Brokers',
            getter: (kafka: any) => getBrokerCount(kafka),
          },
          {
            label: 'Version',
            getter: (kafka: any) => getKafkaVersion(kafka),
          },
          {
            label: 'Listeners',
            getter: (kafka: any) => getListeners(kafka),
          },
          {
            label: 'Status',
            getter: (kafka: any) => {
              const { status, type } = getKafkaStatus(kafka);
              return <StatusLabel status={type}>{status}</StatusLabel>;
            },
          },
        ]}
        data={kafkas}
        emptyMessage="No Kafka clusters found. Deploy a Kafka cluster using Strimzi to get started."
      />
    </SectionBox>
  );
}
