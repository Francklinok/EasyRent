
// Détermine quelle section doit être rendue
const renderSection = () => {
  if (currentSection === 'main') {
    return renderMainSection();
  } else if (currentSection === 'crypto') {
    return renderCryptoSection();
  } else if (currentSection === 'receive') {
    return renderReceivePayment();
  } else if (currentSection === 'security') {
    return renderSecuritySettings();
  } else if (currentSection === 'transactions') {
    return renderTransactions();
  } else if (currentSection.startsWith('transaction-detail-')) {
    const transactionId = currentSection.split('-').pop();
    return renderTransactionDetail(transactionId);
  }
  return renderMainSection();
};