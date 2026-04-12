import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  defaults: {
    baseURL: '',
    headers: {
      common: {}
    }
  }
}));

test('renders application navigation', () => {
  render(<App />);
  const linkElement = screen.getByText(/home/i);
  expect(linkElement).toBeInTheDocument();
});
