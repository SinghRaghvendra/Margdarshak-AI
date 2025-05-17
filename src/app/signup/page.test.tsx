import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpPage from './page';
import { useRouter } from 'next/navigation';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SignUpPage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
    });
    localStorageMock.clear(); // Clear localStorage before each test
  });

  test('renders the signup form', () => {
    render(<SignUpPage />);

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start without signing up/i })).toBeInTheDocument();
  });

  test('allows typing into the email and password fields', () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('shows validation errors for empty fields on sign up attempt', async () => {
    render(<SignUpPage />);

    const signupButton = screen.getByRole('button', { name: /Sign up/i });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email format', async () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const signupButton = screen.getByRole('button', { name: /Sign up/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });

  test('calls localStorage.setItem and redirects on successful signup (simulated)', async () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const signupButton = screen.getByRole('button', { name: /Sign up/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signupButton);

    // In a real scenario, this would involve mocking an API call.
    // For this test, we assume successful validation and check for localStorage and redirect.
    await waitFor(() => {
      expect(localStorageMock.getItem('userEmail')).toBe('test@example.com');
      expect(mockPush).toHaveBeenCalledWith('/psychometric-test');
    });
  });

  test('redirects to psychometric-test page when "Start without signing up" button is clicked', () => {
    render(<SignUpPage />);

    const startButton = screen.getByRole('button', { name: /Start without signing up/i });
    fireEvent.click(startButton);

    expect(mockPush).toHaveBeenCalledWith('/psychometric-test');
  });
});