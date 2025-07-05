// components/FloatingCalculatorButton.jsx
import  { useState } from 'react';
import { Fab, Tooltip, Modal, Box, IconButton } from '@mui/material';
import { Calculate, Close } from '@mui/icons-material';

// CalculatorButton component should be defined outside the main component
const CalculatorButton = ({ children, onClick, color = 'default', variant = 'outlined', sx = {} }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        borderRadius: 1,
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: '1.2rem',
        fontWeight: 'medium',
        transition: 'all 0.2s',
        ...(variant === 'outlined' && {
          border: '1px solid',
          borderColor: color === 'primary' ? 'primary.main' : 
                     color === 'error' ? 'error.main' : 'divider',
          color: color === 'primary' ? 'primary.main' : 
                color === 'error' ? 'error.main' : 'text.primary',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }),
        ...(variant === 'contained' && {
          bgcolor: color === 'primary' ? 'primary.main' : 
                  color === 'error' ? 'error.main' : 'background.default',
          color: color === 'primary' ? 'primary.contrastText' : 
                color === 'error' ? 'error.contrastText' : 'text.primary',
          '&:hover': {
            bgcolor: color === 'primary' ? 'primary.dark' : 
                    color === 'error' ? 'error.dark' : 'action.hover',
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

// Main FloatingCalculatorButton component
const FloatingCalculatorButton = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('0');
  const [previousInput, setPreviousInput] = useState(null);
  const [operation, setOperation] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleButtonClick = (value) => {
    if (input === '0' || input === 'Error') {
      setInput(value);
    } else {
      setInput(input + value);
    }
  };

  const handleOperation = (op) => {
    if (input === 'Error') return;
    
    setPreviousInput(input);
    setOperation(op);
    setInput('0');
  };

  const calculateResult = () => {
    if (!previousInput || !operation) return;
    
    try {
      const prev = parseFloat(previousInput);
      const current = parseFloat(input);
      let result;
      
      switch (operation) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '×': result = prev * current; break;
        case '÷': result = prev / current; break;
        default: return;
      }
      
      setInput(result.toString());
      setPreviousInput(null);
      setOperation(null);
    } catch (error) {
      setInput('Error');
    }
  };

  const clearAll = () => {
    setInput('0');
    setPreviousInput(null);
    setOperation(null);
  };

  const handleDecimal = () => {
    if (input.includes('.')) return;
    setInput(input + '.');
  };

  const handlePercentage = () => {
    setInput((parseFloat(input) / 100).toString());
  };

  const toggleSign = () => {
    setInput(input.startsWith('-') ? input.substring(1) : '-' + input);
  };

  return (
    <>
      <Tooltip title="Calculator" placement="left">
        <Fab
          color="primary"
          size="medium"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 70,
            right: 30,
            zIndex: 2000,
            backgroundColor: '#3c6e71',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#284b55',
              transform: 'scale(1.1)',
              transition: 'transform 0.2s',
            },
          }}
        >
          <Calculate fontSize="large" />
        </Fab>
      </Tooltip>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="calculator-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{
          width: 320,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 2,
          outline: 'none',
          position: 'relative',
        }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <Close />
          </IconButton>

          {/* Calculator Display */}
          <Box sx={{
            mb: 2,
            p: 2,
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: 1,
            textAlign: 'right',
            minHeight: 60,
          }}>
            <Box sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              minHeight: 20,
            }}>
              {previousInput} {operation}
            </Box>
            <Box sx={{
              fontSize: '2rem',
              fontWeight: 'medium',
              wordBreak: 'break-all',
            }}>
              {input}
            </Box>
          </Box>

          {/* Calculator Buttons */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
          }}>
            {/* Row 1 */}
            <CalculatorButton onClick={clearAll} color="error">AC</CalculatorButton>
            <CalculatorButton onClick={toggleSign}>±</CalculatorButton>
            <CalculatorButton onClick={handlePercentage}>%</CalculatorButton>
            <CalculatorButton onClick={() => handleOperation('÷')} color="primary">÷</CalculatorButton>

            {/* Row 2 */}
            <CalculatorButton onClick={() => handleButtonClick('7')}>7</CalculatorButton>
            <CalculatorButton onClick={() => handleButtonClick('8')}>8</CalculatorButton>
            <CalculatorButton onClick={() => handleButtonClick('9')}>9</CalculatorButton>
            <CalculatorButton onClick={() => handleOperation('×')} color="primary">×</CalculatorButton>

            {/* Row 3 */}
            <CalculatorButton onClick={() => handleButtonClick('4')}>4</CalculatorButton>
            <CalculatorButton onClick={() => handleButtonClick('5')}>5</CalculatorButton>
            <CalculatorButton onClick={() => handleButtonClick('6')}>6</CalculatorButton>
            <CalculatorButton onClick={() => handleOperation('-')} color="primary">-</CalculatorButton>

            {/* Row 4 */}
            <CalculatorButton onClick={() => handleButtonClick('1')}>1</CalculatorButton>
            <CalculatorButton onClick={() => handleButtonClick('2')}>2</CalculatorButton>
            <CalculatorButton onClick={() => handleButtonClick('3')}>3</CalculatorButton>
            <CalculatorButton onClick={() => handleOperation('+')} color="primary">+</CalculatorButton>

            {/* Row 5 */}
            <CalculatorButton onClick={() => handleButtonClick('0')} sx={{ gridColumn: 'span 2' }}>0</CalculatorButton>
            <CalculatorButton onClick={handleDecimal}>.</CalculatorButton>
            <CalculatorButton onClick={calculateResult} color="primary" variant="contained">=</CalculatorButton>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default FloatingCalculatorButton;