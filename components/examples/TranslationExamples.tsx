/**
 * EXEMPLES D'UTILISATION DU SYSTÈME DE TRADUCTION
 * Démonstrations complètes de toutes les fonctionnalités
 *
 * EXEMPLES INCLUS:
 * - Utilisation basique des composants
 * - Interface responsive RTL/LTR
 * - Sélecteur de langue avancé
 * - Traductions en temps réel
 * - Intégration avec ThemedComponents
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Switch } from 'react-native';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import {
  TranslatedText,
  TranslatedTextPresets,
  TranslatedView,
  TranslatedViewPresets,
  LanguageSelector,
  TranslationStatusBar,
  TranslationStatusBarPresets,
  useTranslation,
  useInstantTranslation,
  useLanguageSelector,
  useResponsiveText,
  useUltraTranslationSystem,
  initializeUltraTranslation,
  UltraTranslationPresets
} from '../../core/translation';

/**
 * Composant principal d'exemples
 */
export const TranslationExamples: React.FC = () => {
  const [isSystemInitialized, setIsSystemInitialized] = useState(false);
  const [showAdvancedExamples, setShowAdvancedExamples] = useState(false);
  const { system, initialize, getStatus } = useUltraTranslationSystem();

  // Initialiser le système au montage
  useEffect(() => {
    const initSystem = async () => {
      try {
        await initialize(UltraTranslationPresets.Development);
        setIsSystemInitialized(true);
        console.log('✅ Translation system initialized for examples');
      } catch (error) {
        console.error('❌ Failed to initialize translation system:', error);
        Alert.alert('Erreur', 'Impossible d\'initialiser le système de traduction');
      }
    };

    initSystem();
  }, [initialize]);

  if (!isSystemInitialized) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText type="title">Chargement du système de traduction...</ThemedText>
        <ThemedText type="body" style={{ marginTop: 8, textAlign: 'center' }}>
          Initialisation des services de traduction en cours
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      {/* Status Bar */}
      <TranslationStatusBarPresets.Debug />

      <ThemedView style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <ThemedText type="title" style={{ marginBottom: 8 }}>
            🌍 Système de Traduction Ultra
          </ThemedText>
          <ThemedText type="body" variant="secondary">
            Démonstrations complètes des fonctionnalités de traduction automatique
          </ThemedText>

          {/* Toggle exemples avancés */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
            <ThemedText type="body" style={{ marginRight: 12 }}>
              Exemples avancés
            </ThemedText>
            <Switch
              value={showAdvancedExamples}
              onValueChange={setShowAdvancedExamples}
            />
          </View>
        </View>

        {/* Section 1: Composants de base */}
        <ExampleSection title="1. Composants de Base">
          <BasicComponentsExample />
        </ExampleSection>

        {/* Section 2: Sélecteur de langue */}
        <ExampleSection title="2. Sélecteur de Langue">
          <LanguageSelectorExample />
        </ExampleSection>

        {/* Section 3: Layouts RTL/LTR */}
        <ExampleSection title="3. Layouts RTL/LTR">
          <RTLLayoutExample />
        </ExampleSection>

        {/* Section 4: Interface responsive */}
        <ExampleSection title="4. Interface Responsive">
          <ResponsiveExample />
        </ExampleSection>

        {/* Section 5: Hooks avancés */}
        {showAdvancedExamples && (
          <ExampleSection title="5. Hooks Avancés">
            <AdvancedHooksExample />
          </ExampleSection>
        )}

        {/* Section 6: Performance et cache */}
        {showAdvancedExamples && (
          <ExampleSection title="6. Performance et Cache">
            <PerformanceExample />
          </ExampleSection>
        )}

        {/* Section 7: Intégration temps réel */}
        {showAdvancedExamples && (
          <ExampleSection title="7. Traduction Temps Réel">
            <RealTimeExample />
          </ExampleSection>
        )}
      </ThemedView>
    </ScrollView>
  );
};

/**
 * Section d'exemple réutilisable
 */
const ExampleSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <View style={{ marginBottom: 32 }}>
    <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
      {title}
    </ThemedText>
    <ThemedView
      variant="surface"
      elevated="small"
      style={{ padding: 16, borderRadius: 12 }}
    >
      {children}
    </ThemedView>
  </View>
);

/**
 * Exemple 1: Composants de base
 */
const BasicComponentsExample: React.FC = () => {
  const sampleTexts = [
    "Hello, welcome to our application!",
    "This is a longer text that demonstrates how the translation system handles more complex sentences with various words and expressions.",
    "Good morning",
    "How are you today?",
    "Thank you for using our service"
  ];

  return (
    <View style={{ gap: 16 }}>
      <ThemedText type="caption" variant="secondary">
        Exemples de base avec différents presets de TranslatedText
      </ThemedText>

      {/* Titre traduit */}
      <TranslatedTextPresets.Title
        text="Welcome to Ultra Translation"
        showQualityIndicator={true}
      />

      {/* Corps de texte */}
      <TranslatedTextPresets.Body
        text="This application demonstrates advanced translation capabilities with intelligent caching and responsive design."
        showLoadingIndicator={true}
      />

      {/* Liste de textes courts */}
      <View style={{ gap: 8 }}>
        {sampleTexts.map((text, index) => (
          <TranslatedTextPresets.Caption
            key={index}
            text={text}
            translationOptions={{ priority: 'normal', cache: true }}
          />
        ))}
      </View>

      {/* Texte interactif */}
      <TranslatedTextPresets.Interactive
        text="Click here to see advanced translation controls"
        onTranslationComplete={(translation, quality) => {
          console.log(`Translated: ${translation} (Quality: ${quality})`);
        }}
      />
    </View>
  );
};

/**
 * Exemple 2: Sélecteur de langue
 */
const LanguageSelectorExample: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<'dropdown' | 'modal' | 'inline' | 'compact' | 'grid'>('modal');

  const variants: Array<'dropdown' | 'modal' | 'inline' | 'compact' | 'grid'> = ['dropdown', 'modal', 'inline', 'compact', 'grid'];

  return (
    <View style={{ gap: 16 }}>
      <ThemedText type="caption" variant="secondary">
        Différents variants du sélecteur de langue
      </ThemedText>

      {/* Sélecteur de variant */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {variants.map(variant => (
            <TouchableOpacity
              key={variant}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: selectedVariant === variant ? '#007AFF' : '#f0f0f0'
              }}
              onPress={() => setSelectedVariant(variant)}
            >
              <ThemedText
                type="caption"
                style={{
                  color: selectedVariant === variant ? '#ffffff' : '#333333'
                }}
              >
                {variant}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Sélecteur actuel */}
      <LanguageSelector
        variant={selectedVariant}
        showFlags={true}
        showNativeNames={true}
        enableSearch={true}
        enablePreview={selectedVariant === 'modal'}
        previewText="Hello, how are you?"
        onLanguageChange={(language) => {
          console.log('Language changed to:', language.name);
        }}
        style={{ marginVertical: 8 }}
      />
    </View>
  );
};

/**
 * Exemple 3: Layouts RTL/LTR
 */
const RTLLayoutExample: React.FC = () => {
  return (
    <View style={{ gap: 16 }}>
      <ThemedText type="caption" variant="secondary">
        Exemples de layouts adaptatifs RTL/LTR
      </ThemedText>

      {/* Header navigation */}
      <TranslatedViewPresets.NavHeader style={{ backgroundColor: '#f8f9fa' }}>
        <TranslatedText text="Back" type="body" />
        <TranslatedText text="Settings" type="heading" />
        <TranslatedText text="Save" type="body" variant="primary" />
      </TranslatedViewPresets.NavHeader>

      {/* Form layout */}
      <TranslatedViewPresets.Form>
        <TranslatedText text="User Information" type="subtitle" />
        <TranslatedText text="Please fill in your details below" type="body" variant="secondary" />

        <View style={{ marginTop: 12, gap: 8 }}>
          <TranslatedText text="Full Name" type="body" />
          <TranslatedText text="Email Address" type="body" />
          <TranslatedText text="Phone Number" type="body" />
        </View>
      </TranslatedViewPresets.Form>

      {/* Card layout */}
      <TranslatedViewPresets.Card>
        <TranslatedViewPresets.Row>
          <View style={{ flex: 1 }}>
            <TranslatedText text="Premium Features" type="subtitle" />
            <TranslatedText text="Unlock advanced functionality" type="caption" variant="secondary" />
          </View>
          <TranslatedText text="Upgrade" type="body" variant="primary" />
        </TranslatedViewPresets.Row>
      </TranslatedViewPresets.Card>
    </View>
  );
};

/**
 * Exemple 4: Interface responsive
 */
const ResponsiveExample: React.FC = () => {
  const { breakpoint, isMobile, optimizeText } = useResponsiveText();

  const longText = "This is a very long text that will be automatically optimized for different screen sizes. The system will intelligently truncate or adjust the text based on the current viewport size and user preferences.";

  return (
    <View style={{ gap: 16 }}>
      <ThemedText type="caption" variant="secondary">
        Optimisations responsive automatiques (Breakpoint: {breakpoint})
      </ThemedText>

      {/* Info du breakpoint */}
      <View style={{
        padding: 12,
        backgroundColor: isMobile ? '#fff3cd' : '#d4edda',
        borderRadius: 8
      }}>
        <ThemedText type="body">
          Device: {isMobile ? '📱 Mobile' : '🖥️ Desktop/Tablet'}
        </ThemedText>
        <ThemedText type="caption" variant="secondary">
          Current breakpoint: {breakpoint}
        </ThemedText>
      </View>

      {/* Texte optimisé automatiquement */}
      <TranslatedText
        text={longText}
        type="body"
        responsive={true}
        maxLengthMobile={60}
        ellipsisMode="end"
        showLoadingIndicator={true}
      />

      {/* Version manuelle pour comparaison */}
      <ThemedText type="caption" variant="secondary">
        Version optimisée manuellement:
      </ThemedText>
      <ThemedText type="body">
        {optimizeText(longText)}
      </ThemedText>
    </View>
  );
};

/**
 * Exemple 5: Hooks avancés
 */
const AdvancedHooksExample: React.FC = () => {
  const [inputText, setInputText] = useState("Hello, this is a test message for real-time translation!");
  const [translations, setTranslations] = useState<string[]>([]);

  // Hook de traduction en temps réel
  const translationResult = useTranslation(inputText, {
    cache: true,
    priority: 'high',
    responsive: true
  });

  // Hook de traduction instantanée
  const { translate, translateBatch, currentLanguage } = useInstantTranslation();

  // Hook de sélection de langue
  const { languages, popularLanguages, setLanguage } = useLanguageSelector();

  // Traduction par batch
  const handleBatchTranslation = async () => {
    const testTexts = [
      "Good morning",
      "How are you?",
      "Thank you",
      "See you later",
      "Have a nice day"
    ];

    try {
      const results = await translateBatch(testTexts, { priority: 'normal' });
      setTranslations(results);
    } catch (error) {
      console.error('Batch translation failed:', error);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <ThemedText type="caption" variant="secondary">
        Utilisation avancée des hooks de traduction
      </ThemedText>

      {/* Langue courante */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ThemedText type="body" style={{ marginRight: 8 }}>
          Langue actuelle:
        </ThemedText>
        <ThemedText type="body" variant="primary" intensity="strong">
          {currentLanguage.toUpperCase()}
        </ThemedText>
      </View>

      {/* Traduction en temps réel */}
      <View>
        <ThemedText type="body" style={{ marginBottom: 8 }}>
          Traduction temps réel:
        </ThemedText>

        <View style={{
          padding: 12,
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: translationResult.isLoading ? '#ffc107' :
                          translationResult.error ? '#dc3545' : '#28a745'
        }}>
          <ThemedText type="body">
            {translationResult.text}
          </ThemedText>

          {translationResult.isLoading && (
            <ThemedText type="caption" variant="secondary">
              Traduction en cours...
            </ThemedText>
          )}

          {translationResult.error && (
            <ThemedText type="caption" style={{ color: '#dc3545' }}>
              Erreur: {translationResult.error}
            </ThemedText>
          )}

          {!translationResult.isLoading && !translationResult.error && (
            <ThemedText type="caption" variant="secondary">
              Qualité: {Math.round(translationResult.quality * 100)}% |
              {translationResult.fromCache ? ' Cache' : ' API'} |
              {translationResult.sourceLanguage}→{translationResult.targetLanguage}
            </ThemedText>
          )}
        </View>
      </View>

      {/* Traduction par batch */}
      <View>
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: '#007AFF',
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={handleBatchTranslation}
        >
          <ThemedText type="body" style={{ color: '#ffffff' }}>
            Tester la traduction par batch
          </ThemedText>
        </TouchableOpacity>

        {translations.length > 0 && (
          <View style={{ marginTop: 12, gap: 4 }}>
            {translations.map((translation, index) => (
              <View key={index} style={{
                padding: 8,
                backgroundColor: '#e3f2fd',
                borderRadius: 6
              }}>
                <ThemedText type="caption">
                  {translation}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Langues populaires */}
      <View>
        <ThemedText type="body" style={{ marginBottom: 8 }}>
          Langues populaires ({popularLanguages.length}):
        </ThemedText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {popularLanguages.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                onPress={() => setLanguage(lang.code)}
              >
                <ThemedText style={{ marginRight: 4 }}>
                  {lang.flag}
                </ThemedText>
                <ThemedText type="caption">
                  {lang.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

/**
 * Exemple 6: Performance et cache
 */
const PerformanceExample: React.FC = () => {
  const { system, getStatus, optimize } = useUltraTranslationSystem();
  const [systemStatus, setSystemStatus] = useState<any>(null);

  // Charger le status
  useEffect(() => {
    const loadStatus = () => {
      const status = getStatus();
      setSystemStatus(status);
    };

    loadStatus();
    const interval = setInterval(loadStatus, 5000); // Refresh toutes les 5s

    return () => clearInterval(interval);
  }, [getStatus]);

  const handleOptimize = async () => {
    try {
      await optimize();
      Alert.alert('Succès', 'Optimisations appliquées avec succès');

      // Recharger le status
      const status = getStatus();
      setSystemStatus(status);
    } catch (error) {
      Alert.alert('Erreur', 'Échec des optimisations');
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <ThemedText type="caption" variant="secondary">
        Monitoring de performance et optimisations
      </ThemedText>

      {systemStatus && (
        <>
          {/* Métriques principales */}
          <View style={{
            padding: 16,
            backgroundColor: '#f8f9fa',
            borderRadius: 8
          }}>
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
              📊 Métriques Système
            </ThemedText>

            <View style={{ gap: 8 }}>
              <MetricRow label="Traductions totales" value={systemStatus.runtime.totalTranslations} />
              <MetricRow label="Taille du cache" value={`${systemStatus.runtime.cacheSize} items`} />
              <MetricRow label="Usage mémoire" value={`${Math.round(systemStatus.runtime.memoryUsage / 1024)} KB`} />
              <MetricRow label="Qualité moyenne" value={`${systemStatus.performance.averageQuality}%`} />
              <MetricRow label="Statut" value={systemStatus.runtime.isOnline ? '🌐 En ligne' : '📱 Hors ligne'} />
            </View>
          </View>

          {/* Santé du système */}
          <View style={{
            padding: 16,
            backgroundColor: systemStatus.health.overall > 80 ? '#d4edda' :
                          systemStatus.health.overall > 60 ? '#fff3cd' : '#f8d7da',
            borderRadius: 8
          }}>
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
              💚 Santé Système: {systemStatus.health.overall}%
            </ThemedText>

            {systemStatus.health.issues.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <ThemedText type="body" style={{ marginBottom: 4 }}>
                  ⚠️ Problèmes détectés:
                </ThemedText>
                {systemStatus.health.issues.map((issue: string, index: number) => (
                  <ThemedText key={index} type="caption" variant="secondary" style={{ marginLeft: 8 }}>
                    • {issue}
                  </ThemedText>
                ))}
              </View>
            )}

            {systemStatus.health.recommendations.length > 0 && (
              <View>
                <ThemedText type="body" style={{ marginBottom: 4 }}>
                  💡 Recommandations:
                </ThemedText>
                {systemStatus.health.recommendations.map((rec: string, index: number) => (
                  <ThemedText key={index} type="caption" variant="secondary" style={{ marginLeft: 8 }}>
                    • {rec}
                  </ThemedText>
                ))}
              </View>
            )}
          </View>

          {/* Bouton d'optimisation */}
          <TouchableOpacity
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: '#28a745',
              borderRadius: 8,
              alignItems: 'center'
            }}
            onPress={handleOptimize}
          >
            <ThemedText type="body" style={{ color: '#ffffff' }}>
              🚀 Optimiser le Système
            </ThemedText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

/**
 * Exemple 7: Traduction temps réel
 */
const RealTimeExample: React.FC = () => {
  const [liveText, setLiveText] = useState('');
  const [translationHistory, setTranslationHistory] = useState<Array<{
    original: string;
    translated: string;
    timestamp: number;
  }>>([]);

  const { translate } = useInstantTranslation();

  // Simuler des mises à jour en temps réel
  useEffect(() => {
    const messages = [
      "Welcome to our application",
      "How can I help you today?",
      "Your order is being processed",
      "Thank you for your patience",
      "Have a great day!"
    ];

    let index = 0;
    const interval = setInterval(async () => {
      if (index < messages.length) {
        const originalText = messages[index];
        setLiveText(originalText);

        try {
          const translatedText = await translate(originalText);
          setTranslationHistory(prev => [...prev, {
            original: originalText,
            translated: translatedText,
            timestamp: Date.now()
          }]);
        } catch (error) {
          console.error('Real-time translation failed:', error);
        }

        index++;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [translate]);

  return (
    <View style={{ gap: 16 }}>
      <ThemedText type="caption" variant="secondary">
        Démonstration de traduction en temps réel
      </ThemedText>

      {/* Texte actuel */}
      <View style={{
        padding: 16,
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2196f3'
      }}>
        <ThemedText type="body" style={{ marginBottom: 4 }}>
          📝 Message en cours:
        </ThemedText>
        <ThemedText type="body" intensity="strong">
          {liveText || 'En attente du prochain message...'}
        </ThemedText>
      </View>

      {/* Historique des traductions */}
      <View>
        <ThemedText type="body" style={{ marginBottom: 8 }}>
          🕒 Historique ({translationHistory.length} traductions):
        </ThemedText>

        <ScrollView style={{ maxHeight: 200 }}>
          {translationHistory.slice().reverse().map((item, index) => (
            <View key={index} style={{
              padding: 12,
              backgroundColor: '#f8f9fa',
              borderRadius: 6,
              marginBottom: 6
            }}>
              <ThemedText type="caption" variant="secondary">
                Original:
              </ThemedText>
              <ThemedText type="body" style={{ marginBottom: 4 }}>
                {item.original}
              </ThemedText>

              <ThemedText type="caption" variant="secondary">
                Traduction:
              </ThemedText>
              <ThemedText type="body" variant="primary">
                {item.translated}
              </ThemedText>

              <ThemedText type="caption" variant="secondary" style={{ marginTop: 4 }}>
                {new Date(item.timestamp).toLocaleTimeString()}
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

/**
 * Composant pour affichage de métrique
 */
const MetricRow: React.FC<{
  label: string;
  value: string | number;
}> = ({ label, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <ThemedText type="body" variant="secondary">
      {label}
    </ThemedText>
    <ThemedText type="body" intensity="strong">
      {value}
    </ThemedText>
  </View>
);

// TouchableOpacity import fix
import { TouchableOpacity } from 'react-native';

export default TranslationExamples;