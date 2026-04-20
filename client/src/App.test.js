import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => {
  const requestHandlers = [];
  const responseHandlers = [];
  return {
    defaults: {
      baseURL: '',
      headers: {
        common: {}
      }
    },
    interceptors: {
      request: {
        handlers: requestHandlers,
        use: (fulfilled) => {
          requestHandlers.push({ fulfilled });
          return requestHandlers.length - 1;
        },
        eject: (id) => {
          requestHandlers[id] = null;
        }
      },
      response: {
        handlers: responseHandlers,
        use: (fulfilled, rejected) => {
          responseHandlers.push({ fulfilled, rejected });
          return responseHandlers.length - 1;
        },
        eject: (id) => {
          responseHandlers[id] = null;
        }
      }
    }
  };
});

test('renders application navigation', () => {
  render(<App />);
  const linkElement = screen.getByRole('link', { name: /^home$/i });
  expect(linkElement).toBeInTheDocument();
});
