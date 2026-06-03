// components/ErrorBoundary.tsx
// 全局错误边界组件

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>应用发生错误</Text>
          <Text style={styles.message}>
            {this.state.error?.message || '发生未知错误'}
          </Text>

          {__DEV__ && this.state.errorInfo && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>调试信息:</Text>
              <Text style={styles.debugText}>
                {this.state.errorInfo.componentStack}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.primary,
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.base,
  },
  message: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  debugContainer: {
    width: '100%',
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing.xl,
  },
  debugTitle: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  debugText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    fontFamily: 'monospace',
  },
  retryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.base,
  },
  retryButtonText: {
    fontSize: theme.fontSize.body,
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.medium,
  },
});
