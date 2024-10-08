const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const buildQueryParams = (query, filterFields, schema = {}) => {
  let filter = {};
  let sortCriteria = {};
  let pagination = { limit: 10, skip: 0 };

  const {
    sort,             
    sortDirection = 'asc', 
    page = 1,      
    limit = 10,     
    ...filters        
  } = query;

  // Validate the query parameters using the provided schema
  if (sort) {
    const direction = sortDirection === 'desc' ? -1 : 1;
    sortCriteria[sort] = direction;
  }

  pagination.limit = Number(limit);
  pagination.skip = (page - 1) * limit;

  // Apply filters based on the fields provided
  for (let field of filterFields) {
    if (filters[field]) {
      filter[field] = filters[field];
    }
  }

  // Apply optional price range filtering
  if (filters.minPrice || filters.maxPrice) {
    filter.price = {};
    if (filters.minPrice) filter.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) filter.price.$lte = Number(filters.maxPrice);
  }

  return { filter, sortCriteria, pagination };
};

module.exports = buildQueryParams;
