import React, { useState } from 'react';
import { Modal } from 'react-native';
import ActionSelector from './ActionSelector';
import PropertyCreationForm from './PropertyCreationForm';
import ServiceCreationForm from './ServiceCreationForm';

interface CreationManagerProps {
  isVisible: boolean;
  onClose: () => void;
  onPropertyCreated?: (property: any) => void;
  onServiceCreated?: (service: any) => void;
}

type CreationStep = 'selector' | 'property' | 'service';

const CreationManager: React.FC<CreationManagerProps> = ({
  isVisible,
  onClose,
  onPropertyCreated,
  onServiceCreated
}) => {
  const [currentStep, setCurrentStep] = useState<CreationStep>('selector');

  const handleClose = () => {
    setCurrentStep('selector');
    onClose();
  };

  const handleSelectProperty = () => {
    setCurrentStep('property');
  };

  const handleSelectService = () => {
    setCurrentStep('service');
  };

  const handlePropertySuccess = (property: any) => {
    setCurrentStep('selector');
    onPropertyCreated?.(property);
  };

  const handleServiceSuccess = (service: any) => {
    setCurrentStep('selector');
    onServiceCreated?.(service);
  };

  const handleBackToSelector = () => {
    setCurrentStep('selector');
  };

  return (
    <Modal
      animationType="slide"
      transparent={currentStep === 'selector'}
      visible={isVisible}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {currentStep === 'selector' && (
        <ActionSelector
          isVisible={true}
          onClose={handleClose}
          onSelectProperty={handleSelectProperty}
          onSelectService={handleSelectService}
        />
      )}

      {currentStep === 'property' && (
        <PropertyCreationForm
          onClose={handleBackToSelector}
          onSuccess={handlePropertySuccess}
        />
      )}

      {currentStep === 'service' && (
        <ServiceCreationForm
          onClose={handleBackToSelector}
          onSuccess={handleServiceSuccess}
        />
      )}
    </Modal>
  );
};

export default CreationManager;