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
import Chip from '@mui/material/Chip';
import { Icon } from '@iconify/react';
import { useHistory } from 'react-router-dom';

import { KafkaClass, KafkaTopicClass, KafkaUserClass, KafkaConnectClass, KafkaConnectorClass } from '../crdClasses';
import { 
  mockKafkaClusters, 
  mockKafkaTopics, 
  mockKafkaUsers, 
  mockKafkaConnects, 
  mockKafkaConnectors,
  getDataWithMock 
} from '../mockData';

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
        minWidth: 160,
        background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)`,
        border: `1px solid ${color}50`,
        borderRadius: 3,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 12px 32px ${color}35`,
          borderColor: color,
        },
      }}
    >
      <CardActionArea onClick={() => history.push(link)}>
        <CardContent sx={{ py: 2.5 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h2" fontWeight="bold" color={color} sx={{ fontSize: '2.5rem' }}>
                {count}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {title}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: `${color}15`,
              }}
            >
              <Icon icon={icon} width={36} height={36} color={color} />
            </Box>
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

  // Use mock data if no real data available
  const displayKafkas = getDataWithMock(kafkas, mockKafkaClusters as any[], kafkasError);
  const displayTopics = getDataWithMock(topics, mockKafkaTopics as any[], topicsError);
  const displayUsers = getDataWithMock(users, mockKafkaUsers as any[], usersError);
  const displayConnects = getDataWithMock(connects, mockKafkaConnects as any[], connectsError);
  const displayConnectors = getDataWithMock(connectors, mockKafkaConnectors as any[], connectorsError);

  const isLoading = displayKafkas === null || displayTopics === null || displayUsers === null;
  const isDemoMode = kafkasError !== null || (kafkas !== null && kafkas.length === 0);

  // Get recent resources for the activity feed
  const getRecentResources = () => {
    const allResources: { name: string; namespace: string; kind: string; age: string }[] = [];

    displayKafkas?.slice(0, 3).forEach((k: any) => {
      const data = k.jsonData || k;
      allResources.push({
        name: data.metadata?.name || 'Unknown',
        namespace: data.metadata?.namespace || 'N/A',
        kind: 'Kafka',
        age: data.metadata?.creationTimestamp || 'Unknown',
      });
    });

    displayTopics?.slice(0, 4).forEach((t: any) => {
      const data = t.jsonData || t;
      allResources.push({
        name: data.metadata?.name || 'Unknown',
        namespace: data.metadata?.namespace || 'N/A',
        kind: 'KafkaTopic',
        age: data.metadata?.creationTimestamp || 'Unknown',
      });
    });

    displayConnectors?.slice(0, 3).forEach((c: any) => {
      const data = c.jsonData || c;
      allResources.push({
        name: data.metadata?.name || 'Unknown',
        namespace: data.metadata?.namespace || 'N/A',
        kind: 'KafkaConnector',
        age: data.metadata?.creationTimestamp || 'Unknown',
      });
    });

    return allResources.slice(0, 10);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <Box 
          sx={{ 
            p: 1.5, 
            borderRadius: 3, 
            bgcolor: '#1a73e815',
            mr: 2,
          }}
        >
          <Icon icon="mdi:apache-kafka" width={48} height={48} color="#1a73e8" />
        </Box>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h4" fontWeight="bold">
              Strimzi Kafka Manager
            </Typography>
            {isDemoMode && (
              <Chip 
                label="DEMO MODE" 
                size="small" 
                color="warning" 
                sx={{ fontWeight: 600, letterSpacing: 0.5 }}
              />
            )}
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage your Apache Kafka clusters on Kubernetes
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} mb={4}>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            title="Kafka Clusters"
            count={isLoading ? '...' : displayKafkas?.length || 0}
            icon="mdi:server-network"
            color="#1a73e8"
            link="/strimzi/kafkas"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            title="Topics"
            count={isLoading ? '...' : displayTopics?.length || 0}
            icon="mdi:message-text"
            color="#34a853"
            link="/strimzi/topics"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            title="Users"
            count={isLoading ? '...' : displayUsers?.length || 0}
            icon="mdi:account-group"
            color="#ea4335"
            link="/strimzi/users"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            title="Connect"
            count={displayConnects === null ? '...' : displayConnects?.length || 0}
            icon="mdi:connection"
            color="#ff9800"
            link="/strimzi/connects"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <StatCard
            title="Connectors"
            count={displayConnectors === null ? '...' : displayConnectors?.length || 0}
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
              { label: 'Name', getter: (item: any) => (
                <Typography fontWeight={500}>{item.name}</Typography>
              )},
              { label: 'Namespace', getter: (item: any) => (
                <Chip label={item.namespace} size="small" variant="outlined" />
              )},
              { label: 'Kind', getter: (item: any) => (
                <Chip 
                  label={item.kind} 
                  size="small" 
                  color={
                    item.kind === 'Kafka' ? 'primary' : 
                    item.kind === 'KafkaTopic' ? 'success' : 
                    'secondary'
                  }
                  variant="outlined"
                />
              )},
              { label: 'Created', getter: (item: any) => item.age },
            ]}
            data={getRecentResources()}
            emptyMessage="No Strimzi resources found."
          />
        )}
      </SectionBox>

      {/* Quick Links */}
      <SectionBox title="Quick Links">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Icon icon="mdi:book-open-page-variant" width={24} style={{ marginRight: 8, color: '#1a73e8' }} />
                  <Typography variant="h6">Strimzi Documentation</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Learn more about Strimzi and Apache Kafka on Kubernetes
                </Typography>
                <Typography variant="body2" color="primary">
                  <a href="https://strimzi.io/documentation/" target="_blank" rel="noopener noreferrer">
                    strimzi.io/documentation
                  </a>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Icon icon="mdi:github" width={24} style={{ marginRight: 8 }} />
                  <Typography variant="h6">Strimzi GitHub</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Contribute to Strimzi or report issues
                </Typography>
                <Typography variant="body2" color="primary">
                  <a href="https://github.com/strimzi/strimzi-kafka-operator" target="_blank" rel="noopener noreferrer">
                    github.com/strimzi/strimzi-kafka-operator
                  </a>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </SectionBox>
    </Box>
  );
}
