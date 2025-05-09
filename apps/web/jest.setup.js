import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// You can add other global test setup here if needed 