import React from 'react';
import './Form.css';

const Form = ({ 
  onSubmit, 
  children, 
  className = '',
  loading = false 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) {
      onSubmit(e);
    }
  };

  return (
    <form 
      className={`form ${className}`} 
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
};

const FormGroup = ({ 
  label, 
  children, 
  error, 
  required = false,
  className = ''
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

const Input = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`form-input ${className}`}
      {...props}
    />
  );
};

const Select = ({ 
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`form-select ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option 
          key={option.value || option._id || option.id} 
          value={option.value || option._id || option.id}
        >
          {option.label || option.name}
        </option>
      ))}
    </select>
  );
};

const TextArea = ({ 
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`form-textarea ${className}`}
      {...props}
    />
  );
};

const FormActions = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`form-actions ${className}`}>
      {children}
    </div>
  );
};

export { 
  Form, 
  FormGroup, 
  Input, 
  Select, 
  TextArea, 
  FormActions 
};
