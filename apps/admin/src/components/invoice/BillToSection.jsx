import React from "react";
import FloatingLabelInput from "./FloatingLabelInput";
// import { RadioGroup, RadioGroupItem } from "@aotf/ui/components/radio-group";
// import { Label } from "@aotf/ui/components/label";

const BillToSection = ({ billTo, handleInputChange }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Bill To</h2>
      <FloatingLabelInput
        id="billToAddress"
        label="Address"
        value={billTo.address}
        onChange={handleInputChange}
        name="address"
        className="mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingLabelInput
          id="billToName"
          label="Name"
          value={billTo.name}
          onChange={handleInputChange}
          name="name"
        />
        <FloatingLabelInput
          id="billToPhone"
          label="Phone"
          value={billTo.phone}
          onChange={handleInputChange}
          name="phone"
        />
      
      </div>
    </div>
  );
};

export default BillToSection;
