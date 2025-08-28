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

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Up & Continue/i })).toBeInTheDocument();
  });

  test('allows typing into the form fields', () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contact Number/i), { target: { value: '+15551234567' } });
    fireEvent.change(screen.getByLabelText(/Country/i), { target: { value: 'USA' } });

    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/Email Address/i)).toHaveValue('john.doe@example.com');
    expect(screen.getByLabelText(/Contact Number/i)).toHaveValue('+15551234567');
    expect(screen.getByLabelText(/Country/i)).toHaveValue('USA');
  });

  test('shows validation errors for empty fields on submit attempt', async () => {
    render(<SignUpPage />);

    const signupButton = screen.getByRole('button', { name: /Sign Up & Continue/i });
    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters./i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter a valid email./i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter a valid contact number/i)).toBeInTheDocument();
      expect(screen.getByText(/Country must be at least 2 characters./i)).toBeInTheDocument();
    });
  });

  test('calls localStorage.setItem and redirects on successful signup', async () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'jane.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contact Number/i), { target: { value: '+15557654321' } });
    fireEvent.change(screen.getByLabelText(/Country/i), { target: { value: 'Canada' } });
    
    // Simulate selecting a language from the dropdown
    // This part is tricky without seeing the exact Select implementation
    // For now, we assume default is 'English' which is valid

    const signupButton = screen.getByRole('button', { name: /Sign Up & Continue/i });
    fireEvent.click(signupButton);

    await waitFor(() => {
      const storedData = JSON.parse(localStorageMock.getItem('margdarshak_user_info') || '{}');
      expect(storedData.name).toBe('Jane Doe');
      expect(storedData.email).toBe('jane.doe@example.com');
      expect(mockPush).toHaveBeenCalledWith('/birth-details');
    });
  });

  test('redirects to login page when "Login" link is clicked', () => {
    render(<SignUpPage />);
    const loginLink = screen.getByRole('link', { name: /Login/i });
    fireEvent.click(loginLink);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
