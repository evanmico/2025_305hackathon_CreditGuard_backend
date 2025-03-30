import { checkSchema } from 'graphql-validation-middleware';

export const benefitsSchema = {
    name: {
      isString: true,
      errorMessage: 'Name is required and must be a string'
    },
    age: {
      in: ['body'],
      isInt: {
        options: { min: 0 },
        errorMessage: 'Age is required and must be a non-negative integer'
      },
      toInt: true
    }
  };