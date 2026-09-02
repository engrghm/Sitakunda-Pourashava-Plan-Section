import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ConnectionStatusBanner } from './components/ConnectionStatusBanner';
import { NoticeSection } from './components/NoticeSection';
import { NewApplicationForm } from './components/NewApplicationForm';
import { ApplicationSuccessView } from './components/ApplicationSuccessView';
import { ApplicationTrackingView } from './components/ApplicationTrackingView';
import { OfficerDashboard } from './components/OfficerDashboard';
import { ApplicationPrintA4 } from './components/ApplicationPrintA4';
import { DemarcationCertificatePrint } from './components/DemarcationCertificatePrint';
import { Schedule1ApplicationForm } from './components/Schedule1ApplicationForm';
import { Schedule1ApplicationPrintA4 } from './components/Schedule1ApplicationPrintA4';
import { RoadCuttingApplicationForm } from './components/RoadCuttingApplicationForm';
import { RoadCuttingApplicationPrintA4 } from './components/RoadCuttingApplicationPrintA4';
import { RoadCuttingSuccessView } from './components/RoadCuttingSuccessView';
import { Footer } from './components/Footer';
import { DemarcationApplication, BuildingConstructionApplication, RoadCuttingApplication } from './types';
import { getOfficerSession } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'apply' | 'track' | 'schedule1' | 'roadcutting' | 'admin'>('apply');
  const [submittedApp, setSubmittedApp] = useState<DemarcationApplication | null>(null);
  const [submittedRoadCuttingApp, setSubmittedRoadCuttingApp] = useState<RoadCuttingApplication | null>(null);
  const [printApp, setPrintApp] = useState<DemarcationApplication | null>(null);
  const [certificateApp, setCertificateApp] = useState<DemarcationApplication | null>(null);
  const [selectedSchedule1Demarcation, setSelectedSchedule1Demarcation] = useState<DemarcationApplication | null>(null);
  const [schedule1PrintApp, setSchedule1PrintApp] = useState<BuildingConstructionApplication | null>(null);
  const [roadCuttingPrintApp, setRoadCuttingPrintApp] = useState<RoadCuttingApplication | null>(null);
  const [trackSearchId, setTrackSearchId] = useState<string>('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => !!getOfficerSession());

  const isAnyPrintModalOpen = !!(printApp || certificateApp || schedule1PrintApp || roadCuttingPrintApp);

  // Handle auto-routing via query param for QR codes (e.g. ?track=... or ?id=...)
  useEffect(() => {
    const parseUrlAndRoute = () => {
      const params = new URLSearchParams(window.location.search);
      const trackId = params.get('track') || params.get('id') || params.get('applicationId') || params.get('appId');
      if (trackId) {
        setTrackSearchId(trackId);
        setActiveTab('track');
        setSubmittedApp(null);
        setSubmittedRoadCuttingApp(null);
      }
    };

    parseUrlAndRoute();
    window.addEventListener('popstate', parseUrlAndRoute);
    return () => window.removeEventListener('popstate', parseUrlAndRoute);
  }, []);

  // Automatically scroll to top whenever the user switches tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Handle Form Submission Success
  const handleApplicationSubmitted = (newApp: DemarcationApplication) => {
    setSubmittedApp(newApp);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to tracking with prefilled ID and update URL
  const handleGoToTracking = (id: string) => {
    setSubmittedApp(null);
    setSubmittedRoadCuttingApp(null);
    setTrackSearchId(id);
    setActiveTab('track');
    try {
      const newUrl = `${window.location.pathname}?track=${encodeURIComponent(id)}`;
      window.history.pushState({ track: id }, '', newUrl);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to apply another
  const handleApplyAnother = () => {
    setSubmittedApp(null);
    setSubmittedRoadCuttingApp(null);
    setActiveTab('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View A4 Print Preview
  const handleViewPrintA4 = (app: DemarcationApplication) => {
    setPrintApp(app);
  };

  // View Official Certificate Preview
  const handleViewCertificate = (app: DemarcationApplication) => {
    setCertificateApp(app);
  };

  // Handle direct navigation to Schedule-1 from approved certificate/tracking
  const handleApplySchedule1 = (demarcationApp: DemarcationApplication) => {
    setSelectedSchedule1Demarcation(demarcationApp);
    setCertificateApp(null);
    setActiveTab('schedule1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-kalpurush relative">
      {/* Network Connectivity Status Banner */}
      <ConnectionStatusBanner />

      {/* Official Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSubmittedApp(null);
          setSubmittedRoadCuttingApp(null);
          if (tab !== 'schedule1') {
            setSelectedSchedule1Demarcation(null);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${isAnyPrintModalOpen ? 'no-print' : ''}`}>
        {/* Tab 1: Apply for Demarcation & Ownership Certificate */}
        {activeTab === 'apply' && (
          <div>
            {submittedApp ? (
              <ApplicationSuccessView
                application={submittedApp}
                onGoToTracking={handleGoToTracking}
                onViewPrintA4={handleViewPrintA4}
                onApplyAnother={handleApplyAnother}
              />
            ) : (
              <div>
                <NoticeSection />
                <NewApplicationForm onApplicationSubmitted={handleApplicationSubmitted} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Track Application */}
        {activeTab === 'track' && (
          <ApplicationTrackingView
            initialTrackingId={trackSearchId}
            onViewPrintA4={handleViewPrintA4}
            onViewCertificate={handleViewCertificate}
            onApplySchedule1={handleApplySchedule1}
          />
        )}

        {/* Tab 3: Schedule - 1 (Building Construction / Pond Digging / Hill Cutting Approval) */}
        {activeTab === 'schedule1' && (
          <Schedule1ApplicationForm
            initialDemarcationApp={selectedSchedule1Demarcation}
            onSubmitted={(bApp) => {
              setSchedule1PrintApp(bApp);
            }}
            onCancel={() => {
              setActiveTab('apply');
              setSelectedSchedule1Demarcation(null);
            }}
          />
        )}

        {/* Tab 4: Road Cutting Permission Application Form */}
        {activeTab === 'roadcutting' && (
          <div>
            {submittedRoadCuttingApp ? (
              <RoadCuttingSuccessView
                application={submittedRoadCuttingApp}
                onPrintA4={() => setRoadCuttingPrintApp(submittedRoadCuttingApp)}
                onTrack={handleGoToTracking}
                onNewApplication={() => setSubmittedRoadCuttingApp(null)}
              />
            ) : (
              <RoadCuttingApplicationForm
                onSubmitted={(rcApp) => {
                  setSubmittedRoadCuttingApp(rcApp);
                }}
                onCancel={() => {
                  setActiveTab('apply');
                }}
              />
            )}
          </div>
        )}

        {/* Tab 5: Officer / Admin Dashboard */}
        {activeTab === 'admin' && (
          <OfficerDashboard
            onViewPrintA4={handleViewPrintA4}
            onViewCertificate={handleViewCertificate}
            onAuthChange={setIsAdminLoggedIn}
          />
        )}
      </main>

      {/* Printable Official A4 Document Modal (Demarcation) */}
      {printApp && (
        <ApplicationPrintA4
          application={printApp}
          onClose={() => setPrintApp(null)}
        />
      )}

      {/* Official Demarcation Certificate Modal */}
      {certificateApp && (
        <DemarcationCertificatePrint
          application={certificateApp}
          onClose={() => setCertificateApp(null)}
          onApplySchedule1={handleApplySchedule1}
        />
      )}

      {/* Printable Official Schedule - 1 Document Modal */}
      {schedule1PrintApp && (
        <Schedule1ApplicationPrintA4
          application={schedule1PrintApp}
          onClose={() => setSchedule1PrintApp(null)}
        />
      )}

      {/* Printable Official Road Cutting Permission Document Modal */}
      {roadCuttingPrintApp && (
        <RoadCuttingApplicationPrintA4
          application={roadCuttingPrintApp}
          onClose={() => setRoadCuttingPrintApp(null)}
        />
      )}

      {/* Official Footer */}
      <Footer />
    </div>
  );
}