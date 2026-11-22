import { registerStyles as styles } from "@/features/register/styles/register.styles";
import { LGPD_TERMS_VERSION, TERMS_OF_USE_VERSION } from "@/services/authStore";
import {
  PRIVACY_POLICY_DOCUMENT,
  TERMS_OF_USE_DOCUMENT,
} from "@/constants/legalDocuments";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LegalDocumentModal } from "./LegalDocumentModal";

const DOC_TERMS = "terms";
const DOC_PRIVACY = "privacy";

function ConsentRow({ checked, onToggle, onOpenDocument, label, linkLabel, version }) {
  return (
    <View>
      <TouchableOpacity
        style={styles.lgpdRow}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <Ionicons
          name={checked ? "checkbox" : "square-outline"}
          size={22}
          color={checked ? theme.colors.primary : theme.colors.gray_500}
        />
        <Text style={styles.lgpdText}>
          {label}{" "}
          <Text style={styles.lgpdInlineLink} onPress={onOpenDocument}>
            {linkLabel}
          </Text>{" "}
          (v{version}).
        </Text>
      </TouchableOpacity>
      {!checked ? (
        <Text style={styles.lgpdHint}>
          Toque para ler o documento até o final e aceitar.
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Consentimentos do cadastro: Termos de Uso e Política de Privacidade.
 * Cada checkbox só fica marcado depois que o usuário lê o documento até o
 * final na janela flutuante e toca em "Aceito". Desmarcar é livre.
 */
export function LegalConsentSection({
  aceiteTermos,
  setAceiteTermos,
  aceiteLgpd,
  setAceiteLgpd,
}) {
  const [openDocument, setOpenDocument] = useState(null);

  const closeDocument = () => setOpenDocument(null);

  const handleToggle = (document, checked, setChecked) => {
    if (checked) {
      setChecked(false);
      return;
    }
    setOpenDocument(document);
  };

  const handleAccept = () => {
    if (openDocument === DOC_TERMS) setAceiteTermos(true);
    if (openDocument === DOC_PRIVACY) setAceiteLgpd(true);
    closeDocument();
  };

  return (
    <>
      <ConsentRow
        checked={aceiteTermos}
        onToggle={() => handleToggle(DOC_TERMS, aceiteTermos, setAceiteTermos)}
        onOpenDocument={() => setOpenDocument(DOC_TERMS)}
        label="Li e aceito os"
        linkLabel="Termos de Uso"
        version={TERMS_OF_USE_VERSION}
      />

      <ConsentRow
        checked={aceiteLgpd}
        onToggle={() => handleToggle(DOC_PRIVACY, aceiteLgpd, setAceiteLgpd)}
        onOpenDocument={() => setOpenDocument(DOC_PRIVACY)}
        label="Li e aceito a"
        linkLabel="Política de Privacidade e LGPD"
        version={LGPD_TERMS_VERSION}
      />

      <LegalDocumentModal
        visible={openDocument === DOC_TERMS}
        document={TERMS_OF_USE_DOCUMENT}
        version={TERMS_OF_USE_VERSION}
        onClose={closeDocument}
        onAccept={handleAccept}
      />

      <LegalDocumentModal
        visible={openDocument === DOC_PRIVACY}
        document={PRIVACY_POLICY_DOCUMENT}
        version={LGPD_TERMS_VERSION}
        onClose={closeDocument}
        onAccept={handleAccept}
      />
    </>
  );
}
