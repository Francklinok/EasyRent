
// import generateContract from "./generateContract";
// import { Alert } from 'react-native';


// import { GenerateContractParams } from "@/types/generateContratcType";




//   const regenerateContract = async ({
//     setContractId,
//      reservation,
//     property,
//     landlord,
//     tenant,
//     contractId,
//     formatDate,
//     setReservation,
//     setContractFileUri,
//     setGenerating}:GenerateContractParams) => {
//     // Demander confirmation avant de régénérer
//     Alert.alert(
//       "Régénérer le contrat",
//       "Voulez-vous vraiment régénérer le contrat ? Le contrat actuel sera remplacé.",
//       [
//         {
//           text: "Annuler",
//           style: "cancel"
//         },
//         {
//           text: "Régénérer",
//           onPress: async () => {
//             // Générer un nouvel ID de contrat
//             setContractId(`SCF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
//             setContractFileUri(null);
//             await generateContract({
//               reservation,
//               property,
//               landlord,
//               tenant,
//               contractId,
//               formatDate,
//               setReservation,
//               setContractFileUri,
//               setGenerating });
//           }
//         }
//       ]
//     );
//   };
//   export default regenerateContract



import generateContract from "./generateContract";
import { Alert } from "react-native";
import { GenerateContractParams } from "@/types/generateContratcType";

const regenerateContract = async ({
  setContractId,
  reservation,
  property,
  landlord,
  tenant,
  contractId,
  formatDate,
  setReservation,
  setContractFileUri,
  setGenerating,
}: GenerateContractParams) => {
  Alert.alert(
    "Régénérer le contrat",
    "Voulez-vous vraiment régénérer le contrat ? Le contrat actuel sera remplacé.",
    [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Régénérer",
        onPress: async () => {
          try {
            // Générer un nouvel ID de contrat AVANT d'appeler generateContract
            const newContractId = `SCF-${Date.now()
              .toString(36)
              .toUpperCase()}-${Math.random()
              .toString(36)
              .substring(2, 7)
              .toUpperCase()}`;
              
            setContractId(newContractId);
            setContractFileUri(null);

            // Appel de generateContract avec le nouvel ID
            await generateContract({
              reservation,
              property,
              landlord,
              tenant,
              contractId: newContractId, // 🔥 Utiliser le nouvel ID ici
              formatDate,
              setReservation,
              setContractFileUri,
              setGenerating,
            });
          } catch (error) {
            console.error("Erreur lors de la régénération du contrat :", error);
            Alert.alert(
              "Erreur",
              "Une erreur est survenue lors de la régénération du contrat."
            );
          }
        },
      },
    ]
  );
};

export default regenerateContract;
