import React from 'react';

const ItemDetails = ({ items, handleItemChange, addItem, removeItem, currencyCode: propCurrencyCode }) => {
  let currencyCode = propCurrencyCode;
  if (!currencyCode) {
    console.warn("Warning: currencyCode prop not provided to ItemDetails. Defaulting to 'INR'.");
    currencyCode = 'INR';
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Post Details</h2>
    </div>
  );
};

export default ItemDetails;
