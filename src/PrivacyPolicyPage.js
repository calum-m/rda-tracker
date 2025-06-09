import React from 'react';
import { Container, Typography, Box, Link, Paper } from '@mui/material';

const PrivacyPolicyPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Privacy Policy for RDA Tracker
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
          <em>Last updated: 9 June 2025</em>
        </Typography>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to RDA Tracker ("Application"). This Application is designed to help Riding for the Disabled Association (RDA) groups manage coaching sessions and participant information. We are committed to protecting the privacy and security of your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Application. This policy is intended to comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            2. Data Controller
          </Typography>
          <Typography variant="body1" paragraph>
            Highland Group RDA ("We", "Us", "Our") is the data controller for the personal data processed through this Application.
          </Typography>
          <Typography variant="body1" paragraph>
            Contact Details: <Link href="mailto:info@highlandgrouprda.org.uk">info@highlandgrouprda.org.uk</Link>
          </Typography>
          <Typography variant="body1" paragraph>
            Postal Address: Highland Group RDA, Sandycroft, Reelig, Kirkhill, IV5 7PP
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            3. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We may collect and process the following types of personal data:
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" component="span"><strong>User Account Information:</strong> When you register and use the Application, we collect your name and email address (as provided by your Microsoft login). Your user ID (Microsoft Entra ID Object ID) is also stored to link you to your activities within the application.</Typography>
            </li>
            <li>
              <Typography variant="body1" component="span"><strong>Participant (Client) Data:</strong> Information you input about RDA participants, which may include:</Typography>
              <ul>
                <li><Typography variant="body1">Names</Typography></li>
                <li><Typography variant="body1">Lesson plans</Typography></li>
                <li><Typography variant="body1">Evaluation notes</Typography></li>
                <li><Typography variant="body1">Session dates</Typography></li>
                <li><Typography variant="body1">Coach names assigned to sessions</Typography></li>
                <li><Typography variant="body1">Other relevant information for tracking progress and managing sessions.</Typography></li>
              </ul>
            </li>
            <li>
              <Typography variant="body1" component="span"><strong>Consent Information:</strong> We collect and store a record of your consent to this Privacy Policy, including the version of the policy you consented to and the timestamp of your consent.</Typography>
            </li>
            <li>
              <Typography variant="body1" component="span"><strong>Technical Data:</strong> We may collect limited technical information automatically when you use the Application, such as IP address (via Microsoft Dataverse logging, if applicable), browser type, and operating system. This is primarily for security and operational purposes.</Typography>
            </li>
          </ul>
          <Typography variant="body1" paragraph sx={{ mt: 1 }}>
            It is your responsibility to ensure that you have the necessary consent from participants (or their legal guardians) before inputting their personal data into the Application.
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            4. Lawful Basis for Processing
          </Typography>
          <Typography variant="body1" paragraph>
            We process your personal data based on the following lawful bases under the UK GDPR:
          </Typography>
          <ul>
            <li>
              <Typography variant="body1" component="span"><strong>Consent:</strong> For processing your account information for the purpose of providing you access to the Application and for storing participant data that you input. You provide this consent when you agree to this Privacy Policy. You can withdraw your consent at any time, though this may affect your ability to use the Application.</Typography>
            </li>
            <li>
              <Typography variant="body1" component="span"><strong>Legitimate Interests:</strong> For operating and maintaining the Application, ensuring its security, and for internal administrative purposes, provided these interests are not overridden by your data protection rights.</Typography>
            </li>
            <li>
              <Typography variant="body1" component="span"><strong>Legal Obligation:</strong> If we are required to process your data to comply with a legal or regulatory obligation.</Typography>
            </li>
          </ul>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            5. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect in the following ways:
          </Typography>
          <ul>
            <li><Typography variant="body1">To provide, operate, and maintain the Application.</Typography></li>
            <li><Typography variant="body1">To manage your user account and provide you with access to the Application's features.</Typography></li>
            <li><Typography variant="body1">To enable you to input, store, and manage RDA coaching session plans and participant information.</Typography></li>
            <li><Typography variant="body1">To record and manage your consent to our data protection policies.</Typography></li>
            <li><Typography variant="body1">To ensure the security of the Application and the data stored within it.</Typography></li>
            <li><Typography variant="body1">To comply with applicable legal and regulatory requirements.</Typography></li>
            <li><Typography variant="body1">To communicate with you regarding your account or important updates to the Application or this Privacy Policy.</Typography></li>
          </ul>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            6. Data Storage and Security
          </Typography>
          <Typography variant="body1" paragraph>
            Participant data and your consent information are stored securely within the Microsoft Dataverse environment, which is part of the Microsoft Power Platform. Microsoft implements robust security measures to protect data stored in Dataverse. For more information on Microsoft's security practices, please refer to the Microsoft Trust Center.
          </Typography>
          <Typography variant="body1" paragraph>
            We take reasonable technical and organisational measures to protect your personal data from unauthorised access, use, disclosure, alteration, or destruction. These measures include, but are not limited to, access controls, authentication mechanisms (via Microsoft Entra ID), and data encryption where appropriate (as provided by Microsoft Dataverse).
          </Typography>
          <Typography variant="body1" paragraph>
            Despite these measures, please be aware that no security system is impenetrable, and we cannot guarantee the absolute security of your data.
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            7. Data Retention
          </Typography>
          <Typography variant="body1" paragraph>
            We will retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy, or as required by law.
          </Typography>
          <ul>
            <li><Typography variant="body1">User account information will be retained as long as your account is active.</Typography></li>
            <li><Typography variant="body1">Participant data entered by you will be retained as long as your account is active or until you delete it, or as per your RDA group\'s data retention policies.</Typography></li>
            <li><Typography variant="body1">Consent records will be retained as evidence of your agreement to our policies.</Typography></li>
          </ul>
          <Typography variant="body1" paragraph sx={{ mt: 1 }}>
            You are responsible for managing and deleting participant data in accordance with your RDA group\'s policies and relevant data protection laws.
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            8. Your Data Protection Rights
          </Typography>
          <Typography variant="body1" paragraph>
            Under the UK GDPR, you have the following rights regarding your personal data:
          </Typography>
          <ul>
            <li><Typography variant="body1"><strong>The right to be informed:</strong> You have the right to be informed about how we collect and use your personal data.</Typography></li>
            <li><Typography variant="body1"><strong>The right of access:</strong> You have the right to request a copy of the personal data we hold about you.</Typography></li>
            <li><Typography variant="body1"><strong>The right to rectification:</strong> You have the right to request that we correct any inaccurate or incomplete personal data.</Typography></li>
            <li><Typography variant="body1"><strong>The right to erasure (the "right to be forgotten"):</strong> You have the right to request that we delete your personal data, under certain conditions.</Typography></li>
            <li><Typography variant="body1"><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.</Typography></li>
            <li><Typography variant="body1"><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</Typography></li>
            <li><Typography variant="body1"><strong>The right to object:</strong> You have the right to object to our processing of your personal data, under certain conditions.</Typography></li>
            <li><Typography variant="body1"><strong>Rights in relation to automated decision making and profiling:</strong> We do not currently conduct automated decision making or profiling using your personal data.</Typography></li>
          </ul>
          <Typography variant="body1" paragraph sx={{ mt: 1 }}>
            To exercise any of these rights, please contact us at the details provided in Section 2.
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            9. Sharing Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell, trade, or otherwise transfer your personal data to outside parties except as described below:
          </Typography>
          <ul>
            <li><Typography variant="body1"><strong>Microsoft:</strong> As the provider of the Dataverse platform and authentication services (Microsoft Entra ID), Microsoft will process data in accordance with their terms and privacy policies.</Typography></li>
            <li><Typography variant="body1"><strong>Service Providers:</strong> We do not currently engage third-party companies or individuals to facilitate our Application, provide the Application on our behalf, or perform Application-related services that would require access to your personal data beyond what is necessary for the core functionality provided by Microsoft services.</Typography></li>
            <li><Typography variant="body1"><strong>Legal Requirements:</strong> We may disclose your personal data if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</Typography></li>
          </ul>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            10. International Data Transfers
          </Typography>
          <Typography variant="body1" paragraph>
            Your information, including personal data, is stored and processed within Microsoft Dataverse, which may involve data centers located in various regions, potentially including outside the UK. Microsoft adheres to data protection regulations for international data transfers. By using the Application, you consent to the transfer of your data to these locations, subject to Microsoft\'s data protection safeguards.
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            11. Children's Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            This Application is not intended for direct use by children under the age of 13 without parental/guardian consent for the data being entered about them. We do not knowingly collect personally identifiable information from children under 13 through the Application itself (i.e., account creation). Users of the Application are responsible for obtaining appropriate consent from parents or guardians before entering any personal data about children into the Application.
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            12. Changes to This Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. If significant changes are made, we may also re-request your consent.
          </Typography>
          <Typography variant="body1" paragraph>
            You are advised to review this Privacy Policy periodically for any changes.
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            13. Complaints
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any concerns about our use of your personal data, you can make a complaint to us using the contact details in Section 2. You also have the right to lodge a complaint with the Information Commissioner\'s Office (ICO), the UK supervisory authority for data protection issues (www.ico.org.uk).
          </Typography>
        </Box>

        <Box component="section" sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            14. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us at: <Link href="mailto:info@highlandgrouprda.org.uk">info@highlandgrouprda.org.uk</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicyPage;
