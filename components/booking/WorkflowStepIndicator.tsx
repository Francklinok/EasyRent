// import React from 'react';
// import { View, TouchableOpacity } from 'react-native';
// import { ThemedView } from '@/components/ui/ThemedView';
// import { ThemedText } from '@/components/ui/ThemedText';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useTheme } from '@/components/contexts/theme/themehook';
// import { WorkflowStep } from '../contexts/booking/BookingWorkflowContext';

// interface WorkflowStepIndicatorProps {
//   currentStep: WorkflowStep;
//   completedSteps: WorkflowStep[];
//   onStepPress?: (step: WorkflowStep) => void;
//   canAccessStep: (step: WorkflowStep) => boolean;
// }

// interface StepConfig {
//   id: WorkflowStep;
//   label: string;
//   icon: string;
//   description: string;
// }

// const STEPS: StepConfig[] = [
//   {
//     id: 'visit_scheduling',
//     label: 'Visite',
//     icon: 'calendar-check',
//     description: 'Programmer une visite'
//   },
//   {
//     id: 'booking_form',
//     label: 'Réservation',
//     icon: 'file-document-edit',
//     description: 'Formulaire de réservation'
//   },
//   {
//     id: 'documents_upload',
//     label: 'Documents',
//     icon: 'file-upload',
//     description: 'Télécharger les documents'
//   },
//   {
//     id: 'owner_validation',
//     label: 'Validation',
//     icon: 'account-check',
//     description: 'Validation propriétaire'
//   },
//   {
//     id: 'payment',
//     label: 'Paiement',
//     icon: 'credit-card',
//     description: 'Effectuer le paiement'
//   },
//   {
//     id: 'contract_generation',
//     label: 'Contrat',
//     icon: 'file-document',
//     description: 'Génération du contrat'
//   },
//   {
//     id: 'completed',
//     label: 'Terminé',
//     icon: 'check-circle',
//     description: 'Réservation complétée'
//   }
// ];

// export const WorkflowStepIndicator: React.FC<WorkflowStepIndicatorProps> = ({
//   currentStep,
//   completedSteps,
//   onStepPress,
//   canAccessStep
// }) => {
//   const { theme } = useTheme();

//   const getStepStatus = (step: WorkflowStep): 'completed' | 'current' | 'upcoming' | 'locked' => {
//     if (completedSteps.includes(step)) return 'completed';
//     if (currentStep === step) return 'current';
//     if (canAccessStep(step)) return 'upcoming';
//     return 'locked';
//   };

//   const getStepColor = (status: string) => {
//     switch (status) {
//       case 'completed': return theme.success;
//       case 'current': return theme.primary;
//       case 'upcoming': return theme.onSurface + '40';
//       case 'locked': return theme.outline + '30';
//       default: return theme.outline;
//     }
//   };

//   const renderStep = (stepConfig: StepConfig, index: number) => {
//     const status = getStepStatus(stepConfig.id);
//     const color = getStepColor(status);
//     const isAccessible = canAccessStep(stepConfig.id);
//     const isLast = index === STEPS.length - 1;

//     return (
//       <View key={stepConfig.id} style={{ alignItems: 'center', flex: 1 }}>
//         {/* Step circle */}
//         <TouchableOpacity
//           disabled={!isAccessible || !onStepPress}
//           onPress={() => isAccessible && onStepPress?.(stepConfig.id)}
//           style={{
//             width: 48,
//             height: 48,
//             borderRadius: 24,
//             backgroundColor: status === 'completed' ? color : theme.surface,
//             borderWidth: 2,
//             borderColor: color,
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginBottom: 8,
//             elevation: status === 'current' ? 4 : 0,
//             shadowColor: status === 'current' ? theme.primary : 'transparent',
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.3,
//             shadowRadius: 4
//           }}
//         >
//           <MaterialCommunityIcons
//             name={status === 'completed' ? 'check' : stepConfig.icon as any}
//             size={24}
//             color={status === 'completed' ? 'white' : color}
//           />
//         </TouchableOpacity>

//         {/* Step label */}
//         <ThemedText
//           style={{
//             fontSize: 11,
//             fontWeight: status === 'current' ? '600' : '400',
//             color: color,
//             textAlign: 'center'
//           }}
//         >
//           {stepConfig.label}
//         </ThemedText>

//         {/* Connector line */}
//         {!isLast && (
//           <View
//             style={{
//               position: 'absolute',
//               top: 24,
//               left: '50%',
//               right: '-50%',
//               height: 2,
//               backgroundColor: completedSteps.includes(STEPS[index + 1].id)
//                 ? theme.success
//                 : theme.outline + '30'
//             }}
//           />
//         )}
//       </View>
//     );
//   };

//   return (
//     <ThemedView style={{ paddingVertical: 24, paddingHorizontal: 8 }}>
//       {/* Step indicator */}
//       <View style={{
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 16
//       }}>
//         {STEPS.map((step, index) => renderStep(step, index))}
//       </View>

//       {/* Current step description */}
//       <ThemedView style={{
//         padding: 12,
//         backgroundColor: theme.primary + '10',
//         borderRadius: 12,
//         borderLeftWidth: 4,
//         borderLeftColor: theme.primary
//       }}>
//         <ThemedText style={{ color: theme.primary, fontSize: 13 }}>
//           {STEPS.find(s => s.id === currentStep)?.description || 'En cours...'}
//         </ThemedText>
//       </ThemedView>
//     </ThemedView>
//   );
// };

// export default WorkflowStepIndicator;
