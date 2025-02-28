import './button.css';

const GenerateButton = ({ 
      handleOptimize, 
      isProcessing }) => {

  return (
      <button
          onClick={handleOptimize}
          disabled={isProcessing}
          className="generate-button"
          aria-label="Generate Investment Plan"
      >
      </button>
  );
};

export default GenerateButton;

