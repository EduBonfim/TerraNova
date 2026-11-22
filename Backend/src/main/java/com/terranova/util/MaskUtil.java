package com.terranova.util;

// Reune mascaras utilitarias para ocultar parcialmente dados sensiveis.
public final class MaskUtil {

    private MaskUtil() {
    }

    public static String mask(String value) {
        return mask(value, 2, 2);
    }

    // Mantem apenas a quantidade configurada de caracteres visiveis no inicio e no fim.
    public static String mask(String value, int visibleStart, int visibleEnd) {
        if (value == null || value.isBlank()) {
            return value;
        }

        int length = value.length();
        int start = Math.max(0, visibleStart);
        int end = Math.max(0, visibleEnd);

        if (start + end >= length) {
            return repeat('*', length);
        }

        StringBuilder builder = new StringBuilder(length);
        builder.append(value, 0, start);
        builder.append(repeat('*', length - start - end));
        builder.append(value, length - end, length);
        return builder.toString();
    }

    // Mascara o email preservando parte do usuario e a estrutura principal do dominio.
    public static String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return email;
        }

        int atIndex = email.indexOf('@');
        if (atIndex <= 0 || atIndex == email.length() - 1) {
            return mask(email, 2, 2);
        }

        String localPart = email.substring(0, atIndex);
        String domainPart = email.substring(atIndex + 1);

        String maskedLocal;
        if (localPart.length() <= 2) {
            maskedLocal = repeat('*', localPart.length());
        } else {
            maskedLocal = localPart.charAt(0) + repeat('*', localPart.length() - 2) + localPart.charAt(localPart.length() - 1);
        }

        String[] domainSegments = domainPart.split("\\.");
        if (domainSegments.length < 2) {
            return maskedLocal + "@" + mask(domainPart, 1, 1);
        }

        String maskedDomainName = mask(domainSegments[0], 1, 1);
        StringBuilder maskedDomain = new StringBuilder(maskedDomainName);
        for (int i = 1; i < domainSegments.length; i++) {
            maskedDomain.append('.').append(domainSegments[i]);
        }

        return maskedLocal + "@" + maskedDomain;
    }

    // Mantem visiveis apenas os ultimos quatro digitos do telefone.
    public static String maskPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return phone;
        }

        String digitsOnly = phone.replaceAll("\\D", "");
        if (digitsOnly.length() <= 4) {
            return repeat('*', digitsOnly.length());
        }

        return repeat('*', digitsOnly.length() - 4) + digitsOnly.substring(digitsOnly.length() - 4);
    }

    // Mantem visiveis apenas os tres ultimos digitos do CPF e recompõe a formatacao padrao.
    public static String maskCpf(String cpf) {
        if (cpf == null || cpf.isBlank()) {
            return cpf;
        }

        String digitsOnly = cpf.replaceAll("\\D", "");
        if (digitsOnly.length() <= 3) {
            return repeat('*', digitsOnly.length());
        }

        String maskedDigits = repeat('*', digitsOnly.length() - 3) + digitsOnly.substring(digitsOnly.length() - 3);
        return formatCpfLike(maskedDigits);
    }

    // Reaplica a mascara no formato esperado de CPF quando a quantidade de caracteres e valida.
    private static String formatCpfLike(String value) {
        String digitsAndStars = value.replaceAll("[^0-9*]", "");
        if (digitsAndStars.length() != 11) {
            return value;
        }

        return digitsAndStars.substring(0, 3) + "."
                + digitsAndStars.substring(3, 6) + "."
                + digitsAndStars.substring(6, 9) + "-"
                + digitsAndStars.substring(9);
    }

    // Gera a quantidade necessaria de caracteres de mascaramento.
    private static String repeat(char character, int count) {
        if (count <= 0) {
            return "";
        }

        StringBuilder builder = new StringBuilder(count);
        for (int i = 0; i < count; i++) {
            builder.append(character);
        }
        return builder.toString();
    }
}
