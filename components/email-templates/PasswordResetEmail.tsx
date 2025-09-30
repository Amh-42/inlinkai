import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  userName?: string;
  userEmail: string;
  resetUrl: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://inlinkai.com";

export const PasswordResetEmail = ({
  userName = "there",
  userEmail = "user@example.com",
  resetUrl = "https://inlinkai.com/reset-password?token=example&email=user@example.com",
}: PasswordResetEmailProps) => {
  const previewText = `Reset your InlinkAI password`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Heading style={headerTitle}>🔑 Reset Your Password</Heading>
                <Text style={headerSubtitle}>
                  InlinkAI Password Recovery
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={paragraph}>
              Hi {userName},
            </Text>

            <Text style={paragraph}>
              We received a request to reset your password for your InlinkAI account. 
              Click the button below to create a new password:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset My Password
              </Button>
            </Section>

            <Text style={paragraph}>
              If the button doesn't work, you can copy and paste this link into your browser:
            </Text>

            <Text style={linkText}>
              {resetUrl}
            </Text>

            <Section style={warningBox}>
              <Text style={warningTitle}>
                ⚠️ Security Notice
              </Text>
              <Text style={warningText}>
                This link will expire in 1 hour. If you didn't request this reset, 
                you can safely ignore this email.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by InlinkAI. If you have any questions, please contact us at{" "}
              <Link href="mailto:support@inlinkai.com" style={link}>
                support@inlinkai.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

const main = {
  backgroundColor: "#f8fafc",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
};

const container = {
  margin: "40px auto",
  padding: "0",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
  overflow: "hidden",
};

const header = {
  background: "linear-gradient(135deg, #0084FF 0%, #0066CC 100%)",
  padding: "40px 30px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "600",
  letterSpacing: "-0.02em",
  margin: "0",
  lineHeight: "1.2",
};

const headerSubtitle = {
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "16px",
  fontWeight: "400",
  margin: "8px 0 0 0",
  lineHeight: "1.4",
};

const content = {
  padding: "40px 30px",
};

const paragraph = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  display: "inline-block",
  background: "linear-gradient(135deg, #0084FF 0%, #0066CC 100%)",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "600",
  fontSize: "16px",
  padding: "16px 32px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 132, 255, 0.3)",
  border: "none",
  cursor: "pointer",
};

const linkText = {
  color: "#0084FF",
  fontSize: "14px",
  wordBreak: "break-all" as const,
  margin: "8px 0 24px 0",
  lineHeight: "1.4",
};

const warningBox = {
  backgroundColor: "#f9fafb",
  borderLeft: "4px solid #fbbf24",
  padding: "16px",
  borderRadius: "4px",
  margin: "24px 0",
};

const warningTitle = {
  color: "#92400e",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
  lineHeight: "1.4",
};

const warningText = {
  color: "#92400e",
  fontSize: "14px",
  margin: "8px 0 0 0",
  lineHeight: "1.5",
};

const footer = {
  backgroundColor: "#f9fafb",
  padding: "24px 30px",
  borderTop: "1px solid #e5e7eb",
};

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
  lineHeight: "1.4",
};

const link = {
  color: "#0084FF",
  textDecoration: "none",
};
