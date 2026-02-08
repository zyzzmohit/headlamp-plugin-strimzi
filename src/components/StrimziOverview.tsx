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
import { SectionBox, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import { Icon } from '@iconify/react';
import { useHistory } from 'react-router-dom';

import { KafkaClass, KafkaTopicClass, KafkaUserClass, KafkaConnectClass, KafkaConnectorClass } from '../crdClasses';

interface StatCardProps {
  title: string;
  count: number | string;
  icon: string;
  color: string;
  link: string;
}

function StatCard({ title, count, icon, color, link }: StatCardProps) {
  const history = useHistory();

  return (
    <Card
      sx={{
        minWidth: 180,
        background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`,
        border: `1px solid ${color}40`,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${color}30`,
        },
      }}
    >
      <CardActionArea onClick={() => history.push(link)}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h3" fontWeight="bold" color={color}>
                {count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </Box>
            <Icon icon={icon} width={40} height={40} color={color} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function StrimziOverview() {
  // Use the hook pattern for fetching resources
  const [kafkas, kafkasError] = KafkaClass.useList();
  const [topics, topicsError] = KafkaTopicClass.useList();
  const [users, usersError] = KafkaUserClass.useList();
  const [connects, connectsError] = KafkaConnectClass.useList();
  const [connectors, connectorsError] = KafkaConnectorClass.useList();

  const isLoading = kafkas === null || topics === null || users === null;
  const hasError = kafkasError || topicsError || usersError || connectsError || connectorsError;

  // Get recent resources for the activity feed
  const getRecentResources = () => {
    const allResources: { name: string; namespace: string; kind: string; age: string }[] = [];

    kafkas?.slice(0, 3).forEach((k: any) => {
      allResources.push({
        name: k.jsonData?.metadata?.name || 'Unknown',
        namespace: k.jsonData?.metadata?.namespace || 'N/A',
        kind: 'Kafka',
        age: k.jsonData?.metadata?.creationTimestamp || 'Unknown',
      });
    });

    topics?.slice(0, 3).forEach((t: any) => {
      allResources.push({
        name: t.jsonData?.metadata?.name || 'Unknown',
        namespace: t.jsonData?.metadata?.namespace || 'N/A',
        kind: 'KafkaTopic',
        age: t.jsonData?.metadata?.creationTimestamp || 'Unknown',
      });
    });

    connectors?.slice(0, 2).forEach((c: any) => {
      allResources.push({
        name: c.jsonData?.metadata?.name || 'Unknown',
        namespace: c.jsonData?.metadata?.namespace || 'N/A',
        kind: 'KafkaConnector',
        age: c.jsonData?.metadata?.creationTimestamp || 'Unknown',
      });
    });

    return allResources.slice(0, 10);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <Icon icon="mdi:apache-kafka" width={48} height={48} color="#1a73e8" />
        <Box ml={2}>
          <Typography variant="h4" fontWeight="bold">
            Strimzi Kafka Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your Apache Kafka clusters on Kubernetes
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            title="Kafka Clusters"
            count={isLoading ? '...' : kafkas?.length || 0}
            icon="mdi:server-network"
            color="#1a73e8"
            link="/strimzi/kafkas"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            title="Topics"
            count={isLoading ? '...' : topics?.length || 0}
            icon="mdi:message-text"
            color="#34a853"
            link="/strimzi/topics"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            title="Users"
            count={isLoading ? '...' : users?.length || 0}
            icon="mdi:account-group"
            color="#ea4335"
            link="/strimzi/users"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            title="Connect"
            count={connects === null ? '...' : connects?.length || 0}
            icon="mdi:connection"
            color="#ff9800"
            link="/strimzi/connects"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            title="Connectors"
            count={connectors === null ? '...' : connectors?.length || 0}
            icon="mdi:pipe"
            color="#9c27b0"
            link="/strimzi/connectors"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <SectionBox title="Recent Resources">
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : (
          <SimpleTable
            columns={[
              { label: 'Name', getter: (item: any) => item.name },
              { label: 'Namespace', getter: (item: any) => item.namespace },
              { label: 'Kind', getter: (item: any) => item.kind },
              { label: 'Created', getter: (item: any) => item.age },
            ]}
            data={getRecentResources()}
            emptyMessage="No Strimzi resources found. Make sure Strimzi is installed in your cluster."
          />
        )}
      </SectionBox>

      {/* Quick Links */}
      <SectionBox title="Quick Links">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Icon icon="mdi:book-open-page-variant" style={{ marginRight: 8 }} />
                  Strimzi Documentation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Learn more about Strimzi and Apache Kafka on Kubernetes
                </Typography>
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  <a href="https://strimzi.io/documentation/" target="_blank" rel="noopener noreferrer">
                    https://strimzi.io/documentation/
                  </a>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Icon icon="mdi:github" style={{ marginRight: 8 }} />
                  Strimzi GitHub
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contribute to Strimzi or report issues
                </Typography>
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  <a href="https://github.com/strimzi/strimzi-kafka-operator" target="_blank" rel="noopener noreferrer">
                    https://github.com/strimzi/strimzi-kafka-operator
                  </a>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </SectionBox>

      {hasError && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography color="warning.contrastText">
            Note: Some resources could not be loaded. Make sure Strimzi CRDs are installed in your cluster.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
