import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { MotiView } from 'moti';
import { ChevronLeft, Smartphone, Check } from 'lucide-react-native';
import { UserAction, MobileMoneyConfig, MOBILE_MONEY_COUNTRIES, CountryMobileMoneyConfig, MobileMoneyOperator } from '@/types/payment';
import { paymentConfigService } from '@/services/PaymentConfigService';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/hooks/themehook';
import { useLanguage } from '@/components/contexts/language';

interface MobileMoneyFormProps {
    action: UserAction;
    existingConfig?: MobileMoneyConfig;
    onBack: () => void;
    onSuccess: () => void;
}

export const MobileMoneyForm: React.FC<MobileMoneyFormProps> = ({
    action,
    existingConfig,
    onBack,
    onSuccess
}) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryMobileMoneyConfig | null>(
        existingConfig ? MOBILE_MONEY_COUNTRIES.find(c => c.countryCode === existingConfig.countryCode) || null : null
    );
    const [selectedOperator, setSelectedOperator] = useState<MobileMoneyOperator | null>(
        existingConfig && selectedCountry
            ? selectedCountry.operators.find(op => op.code === existingConfig.operator) || null
            : null
    );
    const [phoneNumber, setPhoneNumber] = useState(existingConfig?.phoneNumber || '');
    const [saveConfig, setSaveConfig] = useState(false);
    const [processing, setProcessing] = useState(false);
    const { theme } = useTheme();
    const { t } = useLanguage();

    const handleConfirm = async () => {
        if (!selectedCountry || !selectedOperator || !phoneNumber) {
            Alert.alert(t('walletComponents.error'), t('walletComponents.fillAllFields'));
            return;
        }

        setProcessing(true);
        try {
            // save  the  config if needed
            if (saveConfig || existingConfig) {
                await paymentConfigService.saveMobileMoneyConfig({
                    type: 'mobile_money',
                    country: selectedCountry.countryName,
                    countryCode: selectedCountry.countryCode,
                    operator: selectedOperator.code,
                    phoneNumber,
                    isConfigured: true,
                    isDefault: !existingConfig 
                });
            }

           // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            Alert.alert(
                t('walletComponents.success'),
                t('walletComponents.paymentSuccessMessage', { amount: action.amount, currency: action.currency }),
                [{ text: 'OK', onPress: onSuccess }]
            );
        } catch (error) {
            Alert.alert(t('walletComponents.error'), t('walletComponents.paymentError'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Action Summary */}
            <ThemedView style={styles.actionSummary}>
                <ThemedText type = "normaltitle"  >{action.title} : </ThemedText>
                <ThemedText type = "subtitle" intensity = "strong" >
                     {action.amount.toLocaleString()} {action.currency}
                </ThemedText>
            </ThemedView>

            {/* Form */}
            <ScrollView>
            <ThemedView style={styles.form}>
                {/* Country Selection */}
                <ThemedView style={styles.section}>
                    {/* <ThemedText type = "normal">Pays</ThemedText> */}
                    <ThemedView style={styles.optionsGrid}>
                        {MOBILE_MONEY_COUNTRIES.map((country) => (
                            <TouchableOpacity
                                key={country.countryCode}
                                style = {{
                                    padding:8,
                                    minWidth: '45%',
                                    borderWidth: 1,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    borderColor: theme.outline,
                                    shadowColor:theme.shadow,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    aligneItems: 'center',
                                    gap:10,
                                    marginLeft:4,
                                }}
                        
                                onPress={() => {
                                    setSelectedCountry(country);
                                    setSelectedOperator(null);
                                }}
                            >
                                <ThemedText style={styles.countryFlag}>{country.flag}</ThemedText>
                                <ThemedText type = "body" intensity = "strong"style = {{color: theme.text + "99"}}>{country.countryName}</ThemedText>
                                {selectedCountry?.countryCode === country.countryCode && (
                                    <ThemedView style={styles.checkmark}>
                                        <Check size={16} color= {theme.success} />
                                    </ThemedView>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ThemedView>
                </ThemedView>

                {/* Operator Selection */}
                {selectedCountry && (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={styles.section}
                    >
                        <ThemedText type = "normal" style = {{color: theme.text}}>{t('walletComponents.operator')}</ThemedText>
                        <ThemedView style={styles.operatorsList}>
                            {selectedCountry.operators.map((operator) => (
                                <TouchableOpacity
                                    key={operator.code}
                                style = {{
                                    display:'flex',
                                    flexDirection:'row',
                                    padding:14,
                                    alignItems:'center',
                                    borderWidth: 1,
                                    borderRadius: 12,
                                    borderColor:  theme.outline,
                                    shadowColor:theme.shadow,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    gap:10,
                                }}
                                
                                    onPress={() => setSelectedOperator(operator)}
                                >
                                    <Smartphone size={20} color={ theme.text + "80"} />
                                    <ThemedText type = "body" intensity='strong'
                                   
                                    style = {{ color: theme.text + "99"}}
                                    >
                                        {operator.name}
                                    </ThemedText>
                                    {selectedOperator?.code === operator.code && (
                                        <Check size={18} color={theme.success} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ThemedView>
                    </MotiView>
                )}

                {/* Phone Number */}
                {selectedOperator && (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={styles.section}
                    >
                        <ThemedText  type = "normal" style = {{color: theme.text}}>{t('walletComponents.phoneNumber')}</ThemedText>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderRadius: 12,
                                borderColor: theme.outline,
                                padding: 12,
                                fontSize: 16,}}
                            placeholder={t('walletComponents.phoneNumberPlaceholder')}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            maxLength={15}
                        />
                        {selectedOperator.prefixes.length > 0 && (
                            <ThemedText type = "caption" intensity='light' >
                                {t('walletComponents.acceptedPrefixes', { prefixes: selectedOperator.prefixes.join(', ') })}
                            </ThemedText>
                        )}
                    </MotiView>
                )}

                {/* Save Config */}
                {!existingConfig && phoneNumber && (
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={styles.section}
                    >
                        <TouchableOpacity
                            style={styles.saveConfigRow}
                            onPress={() => setSaveConfig(!saveConfig)}
                        >
                            <ThemedView style={{
                                width: 24,
                                height: 24,
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: theme.outline,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: saveConfig ? theme.secondary : 'transparent',}}>
                                {saveConfig && <Check size={16} color="white" />}
                            </ThemedView>
                            <ThemedText type = "normal" intensity = "light" >
                                {t('walletComponents.saveMethodForFuture')}
                            </ThemedText>
                        </TouchableOpacity>
                    </MotiView>
                )}

                {/* Confirm Button */}
                {phoneNumber && (
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={styles.section}
                    >
                        <TouchableOpacity
                            onPress={handleConfirm}
                            disabled={processing}
                            style = {{
                                display:'flex',
                                flexDirection:'row',
                                alignItems:'center',
                                justifyContent:'center',
                                padding:14,
                                borderRadius:12,
                                backgroundColor:theme.secondary,}}
                        >
                            <ThemedText type = "body" intensity = "strong" style = {{ color: 'white' }}>
                                {processing ? t('walletComponents.processing') : t('walletComponents.pay', { amount: action.amount.toLocaleString(), currency: action.currency })}
                            </ThemedText>
                        </TouchableOpacity>
                    </MotiView>
                )}
            </ThemedView>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    actionSummary: {
        display: 'flex',
        flexDirection: 'row',
        marginHorizontal: 8,
        padding: 16,
        borderRadius: 12,
        marginBottom: 0,
    },
    form: {
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    section: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 12,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        padding:2
    },
    countryFlag: {
        fontSize: 36,
        marginBottom: 2,
    },
    countryName: {
        textAlign: 'center',
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    operatorsList: {
        gap: 12,
    },
    operatorName: {
        flex: 1,
    },
    saveConfigRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    confirmButtonDisabled: {
        opacity: 0.6,
    },
   
});
