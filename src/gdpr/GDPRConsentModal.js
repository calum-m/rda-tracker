import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Link,
  FormGroup,
  Paper
} from '@mui/material';
import {
  ExpandMore,
  Security,
  MedicalServices,
  CameraAlt,
  Email,
  Analytics,
  Info
} from '@mui/icons-material';

const GDPRConsentModal = ({ 
  open, 
  onAgree, 
  onDisagree, 
  userName, 
  latestPolicyVersion,
  existingConsents = null,
  isUpdate = false
}) => {
  const [consents, setConsents] = useState({
    essential: true, // Always required
    medicalData: false,
    progressPhotos: false,
    communications: false,
    analytics: false,
    datasharing: false
  });

  const [understandingConfirmed, setUnderstandingConfirmed] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [parentalConsent, setParentalConsent] = useState(false);

  useEffect(() => {
    if (existingConsents) {
      setConsents({
        essential: true,
        medicalData: existingConsents.medicalData || false,
        progressPhotos: existingConsents.progressPhotos || false,
        communications: existingConsents.communications || false,
        analytics: existingConsents.analytics || false,
        datasharing: existingConsents.datasharing || false
      });
      setIsMinor(existingConsents.isMinor || false);
      setParentalConsent(existingConsents.parentalConsent || false);
    }
  }, [existingConsents]);

  const handleConsentChange = (consentType) => (event) => {
    setConsents(prev => ({
      ...prev,
      [consentType]: event.target.checked
    }));
  };

  const handleAgree = () => {
    const consentData = {
      version: latestPolicyVersion,
      timestamp: new Date().toISOString(),
      consents,
      isMinor,
      parentalConsent: isMinor ? parentalConsent : true,
      ipAddress: 'logged', // For audit trail
      userAgent: navigator.userAgent,
      understandingConfirmed
    };

    onAgree(consentData);
  };

  const canProceed = () => {
    if (isMinor && !parentalConsent) return false;
    if (!understandingConfirmed) return false;
    return true;
  };

  const consentItems = [
    {
      key: 'essential',
      title: 'Essential Data Processing',
      description: 'Required for app functionality, account management, and safeguarding',
      icon: <Security />,
      required: true,
      details: 'This includes your name, contact details, session attendance, and basic information needed to provide RDA services safely.',
      legalBasis: 'Legitimate Interest & Vital Interests (safeguarding)'
    },
    {
      key: 'medicalData',
      title: 'Medical & Health Information',
      description: 'Store and process medical conditions, medications, and health notes',
      icon: <MedicalServices />,
      required: false,
      details: 'Medical information helps coaches provide appropriate activities and ensure safety. This is special category data under GDPR.',
      legalBasis: 'Explicit Consent',
      retention: '7 years after last session'
    },
    {
      key: 'progressPhotos',
      title: 'Progress Photos & Videos',
      description: 'Capture and store images/videos for progress tracking and celebration',
      icon: <CameraAlt />,
      required: false,
      details: 'Photos and videos may include the participant, horses, and coaches. Used for progress tracking and may be shared with parents/guardians.',
      legalBasis: 'Explicit Consent',
      retention: '2 years or until consent withdrawn'
    },
    {
      key: 'communications',
      title: 'Communications & Notifications',
      description: 'Send session reminders, updates, and newsletters via email/SMS',
      icon: <Email />,
      required: false,
      details: 'We may send session reminders, progress updates, safety notices, and occasional newsletters about RDA activities.',
      legalBasis: 'Consent',
      retention: 'Until consent withdrawn'
    },
    {
      key: 'analytics',
      title: 'Usage Analytics',
      description: 'Collect anonymized usage data to improve the app',
      icon: <Analytics />,
      required: false,
      details: 'Anonymous data about how the app is used helps us improve features and fix issues. No personal information is included.',
      legalBasis: 'Legitimate Interest',
      retention: '26 months maximum'
    },
    {
      key: 'datasharing',
      title: 'Data Sharing for RDA Purposes',
      description: 'Share anonymized data with RDA national organization for research',
      icon: <Info />,
      required: false,
      details: 'Anonymized session and progress data may be shared with RDA UK for research into therapeutic benefits and service improvement.',
      legalBasis: 'Consent',
      retention: 'As per RDA UK data retention policy'
    }
  ];

  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Security color="primary" />
          <Box>
            <Typography variant="h6">
              {isUpdate ? 'Update Privacy Preferences' : 'Data Protection & Privacy Consent'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Policy Version: {latestPolicyVersion}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {userName && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Hello {userName},</strong> We need your consent to process your personal data. 
              {isUpdate ? ' You can update your preferences below.' : ' Please review each category carefully.'}
            </Typography>
          </Alert>
        )}

        {/* Age Check */}
        <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isMinor}
                onChange={(e) => setIsMinor(e.target.checked)}
                color="warning"
              />
            }
            label={
              <Typography variant="body2">
                <strong>The participant is under 16 years old</strong>
              </Typography>
            }
          />
          
          {isMinor && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                For participants under 16, a parent or guardian must provide consent:
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={parentalConsent}
                    onChange={(e) => setParentalConsent(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Typography variant="body2">
                    <strong>I am a parent/guardian and provide consent on behalf of the participant</strong>
                  </Typography>
                }
              />
            </Box>
          )}
        </Paper>

        {/* Consent Categories */}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Data Processing Categories
        </Typography>
        
        <FormGroup>
          {consentItems.map((item) => (
            <Accordion key={item.key} defaultExpanded={item.required}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  {item.icon}
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {item.title}
                      </Typography>
                      {item.required && (
                        <Typography variant="caption" color="error">
                          (Required)
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={consents[item.key]}
                        onChange={handleConsentChange(item.key)}
                        disabled={item.required}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label=""
                    onClick={(e) => e.stopPropagation()}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body2" paragraph>
                    {item.details}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <strong>Legal Basis:</strong> {item.legalBasis}
                  </Typography>
                  {item.retention && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      <strong>Data Retention:</strong> {item.retention}
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </FormGroup>

        <Divider sx={{ my: 3 }} />

        {/* Your Rights */}
        <Typography variant="h6" gutterBottom>
          Your Data Protection Rights
        </Typography>
        <Typography variant="body2" paragraph>
          Under GDPR, you have the right to:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
          <Typography component="li" variant="body2">Access your personal data (download a copy)</Typography>
          <Typography component="li" variant="body2">Rectify (correct) inaccurate data</Typography>
          <Typography component="li" variant="body2">Erase your data ("right to be forgotten")</Typography>
          <Typography component="li" variant="body2">Restrict or object to processing</Typography>
          <Typography component="li" variant="body2">Data portability (transfer to another service)</Typography>
          <Typography component="li" variant="body2">Withdraw consent at any time</Typography>
        </Box>

        <Typography variant="body2" paragraph>
          To exercise these rights, visit your Privacy Dashboard in the app settings or contact{' '}
          <Link href="mailto:privacy@highlandgrouprda.org.uk">
            privacy@highlandgrouprda.org.uk
          </Link>
        </Typography>

        {/* Understanding Confirmation */}
        <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: 'primary.light' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={understandingConfirmed}
                onChange={(e) => setUnderstandingConfirmed(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                <strong>I understand my rights and how my data will be processed</strong>
              </Typography>
            }
          />
        </Paper>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          You can change these preferences at any time in your Privacy Dashboard. 
          For our full privacy policy, visit{' '}
          <Link href="/privacy-policy" target="_blank">
            Privacy Policy
          </Link>
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onDisagree}
          variant="outlined"
          color="secondary"
        >
          {isUpdate ? 'Cancel' : 'I Do Not Consent'}
        </Button>
        <Button 
          onClick={handleAgree}
          variant="contained"
          disabled={!canProceed()}
        >
          {isUpdate ? 'Update Preferences' : 'I Consent'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GDPRConsentModal;