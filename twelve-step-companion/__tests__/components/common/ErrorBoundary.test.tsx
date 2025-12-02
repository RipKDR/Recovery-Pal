/**
 * ErrorBoundary Component Tests
 * Tests for error catching and graceful fallback UI
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { ErrorBoundary, SectionErrorFallback } from '../../../components/common/ErrorBoundary';

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Working component</Text>;
};

// Suppress console.error for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('normal rendering', () => {
    it('should render children when no error', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>Child component</Text>
        </ErrorBoundary>
      );

      expect(getByText('Child component')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>First child</Text>
          <Text>Second child</Text>
        </ErrorBoundary>
      );

      expect(getByText('First child')).toBeTruthy();
      expect(getByText('Second child')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should catch errors and show fallback UI', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('should show supportive messaging in fallback', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText(/your data is safe/i)).toBeTruthy();
      expect(getByText(/recovery journey matters/i)).toBeTruthy();
    });

    it('should show crisis resources in fallback', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText(/988/)).toBeTruthy();
      expect(getByText(/Crisis/i)).toBeTruthy();
    });

    it('should show retry button', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Try Again')).toBeTruthy();
    });

    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('custom fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <Text>Custom error message</Text>;

      const { getByText, queryByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Custom error message')).toBeTruthy();
      expect(queryByText('Something went wrong')).toBeNull();
    });
  });

  describe('retry functionality', () => {
    it('should allow retry after error', () => {
      let shouldThrow = true;

      const DynamicComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <Text>Recovered</Text>;
      };

      const { getByText, queryByText } = render(
        <ErrorBoundary>
          <DynamicComponent />
        </ErrorBoundary>
      );

      // Error state
      expect(getByText('Something went wrong')).toBeTruthy();

      // Fix the error and retry
      shouldThrow = false;
      fireEvent.press(getByText('Try Again'));

      // Should now show recovered content
      expect(queryByText('Something went wrong')).toBeNull();
    });
  });
});

describe('SectionErrorFallback', () => {
  it('should render error message', () => {
    const { getByText } = render(
      <SectionErrorFallback message="Section failed to load" />
    );

    expect(getByText('Section failed to load')).toBeTruthy();
  });

  it('should render default message when not provided', () => {
    const { getByText } = render(<SectionErrorFallback />);

    expect(getByText("This section couldn't load")).toBeTruthy();
  });

  it('should show retry button when onRetry provided', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <SectionErrorFallback onRetry={onRetry} />
    );

    expect(getByText('Tap to retry')).toBeTruthy();
  });

  it('should not show retry button when onRetry not provided', () => {
    const { queryByText } = render(<SectionErrorFallback />);

    expect(queryByText('Tap to retry')).toBeNull();
  });

  it('should call onRetry when retry button pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <SectionErrorFallback onRetry={onRetry} />
    );

    fireEvent.press(getByText('Tap to retry'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

