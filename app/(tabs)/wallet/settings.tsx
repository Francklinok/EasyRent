import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { WalletSettings } from '@/components/wallets/WalletSettings';
import { PaymentMethodType } from '@/types/payment';
import { useWalletHeader } from './_layout';
import { useLanguage } from '@/components/contexts/language';

export default function SettingsScreen() {
    const { setTitle, setShowSettingsButton } = useWalletHeader();
    const { t } = useLanguage();

    useEffect(() => {
        setTitle(t('walletComponents.settings'));
        setShowSettingsButton(false); // Masquer le bouton settings quand on est déjà sur settings
    }, []);

    const handleBack = () => {
        router.back();
    };

    const handleConfigureMethod = (type: PaymentMethodType) => {
        switch (type) {
            case 'mobile_money':
                router.push('/wallet/configure-mobile-money' as any);
                break;
            case 'bank_card':
                router.push('/wallet/bank-card-form' as any);
                break;
            case 'paypal':
                router.push('/wallet/paypal-form' as any);
                break;
        }
    };

    return (
        <WalletSettings
            onBack={handleBack}
            onConfigureMethod={handleConfigureMethod}
        />
    );
}
