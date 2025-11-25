/**
 * Error Boundary Component
 * Catches JavaScript errors and displays a graceful fallback UI
 * Phase 4: Production polish
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error for debugging (in production, send to crash reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
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
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          >
            <View className="items-center">
              {/* Error Icon */}
              <View className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center mb-6">
                <Text className="text-4xl">😔</Text>
              </View>

              {/* Error Message */}
              <Text 
                className="text-2xl font-bold text-surface-900 dark:text-surface-100 text-center mb-2"
                accessibilityRole="header"
              >
                Something went wrong
              </Text>
              <Text className="text-surface-600 dark:text-surface-400 text-center mb-8 px-4">
                Don't worry — your data is safe. This is just a temporary hiccup.
              </Text>

              {/* Supportive message */}
              <View className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-8 w-full">
                <Text className="text-primary-800 dark:text-primary-200 text-center">
                  💚 Your recovery journey matters. Take a deep breath, and let's try again.
                </Text>
              </View>

              {/* Retry Button */}
              <TouchableOpacity
                onPress={this.handleRetry}
                className="bg-primary-600 rounded-xl px-8 py-4 mb-4"
                accessibilityRole="button"
                accessibilityLabel="Try again"
              >
                <Text className="text-white font-semibold text-lg">
                  Try Again
                </Text>
              </TouchableOpacity>

              {/* Emergency Access */}
              <Text className="text-surface-500 text-center text-sm mt-6 px-8">
                If you need immediate support, remember you can always reach out:
              </Text>
              <View className="mt-4 p-4 border border-red-200 dark:border-red-800 rounded-xl w-full">
                <Text className="text-red-600 dark:text-red-400 text-center font-semibold">
                  🆘 Crisis Hotline: 988
                </Text>
                <Text className="text-surface-500 text-center text-sm mt-1">
                  Suicide & Crisis Lifeline (US)
                </Text>
              </View>
            </View>

            {/* Debug info (only in development) */}
            {__DEV__ && this.state.error && (
              <View className="mt-8 p-4 bg-surface-100 dark:bg-surface-800 rounded-xl">
                <Text className="text-surface-500 text-xs font-mono mb-2">
                  Debug Info:
                </Text>
                <Text className="text-red-600 dark:text-red-400 text-xs font-mono">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo?.componentStack && (
                  <Text className="text-surface-400 text-xs font-mono mt-2">
                    {this.state.errorInfo.componentStack.slice(0, 500)}...
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight error fallback for specific sections
 */
export function SectionErrorFallback({ 
  onRetry, 
  message = "This section couldn't load" 
}: { 
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <View className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl items-center">
      <Text className="text-amber-800 dark:text-amber-200 text-center mb-3">
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="px-4 py-2 bg-amber-200 dark:bg-amber-800 rounded-lg"
          accessibilityRole="button"
          accessibilityLabel="Retry loading"
        >
          <Text className="text-amber-800 dark:text-amber-200 font-medium">
            Tap to retry
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default ErrorBoundary;

