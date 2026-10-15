import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider, useGame } from '../store/GameProvider';
import { NavProvider, useNav, type Route, type TabId } from '../store/NavProvider';
import { ToastProvider } from '../store/ToastProvider';
import { TabBar } from '../components/layout/TabBar';
import { GainOverlay } from '../components/game/GainOverlay';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { UserScreen } from '../screens/profile/UserScreen';
import { XpGuideScreen } from '../screens/profile/XpGuideScreen';
import { JournalScreen } from '../screens/profile/JournalScreen';
import { AchievementsScreen } from '../screens/profile/AchievementsScreen';
import { RankingScreen } from '../screens/ranking/RankingScreen';
import { ChallengesScreen } from '../screens/challenges/ChallengesScreen';
import { CommunityScreen } from '../screens/community/CommunityScreen';
import { FriendsScreen } from '../screens/friends/FriendsScreen';
import { CheckInScreen } from '../screens/checkin/CheckInScreen';
import { ClubsScreen } from '../screens/clubs/ClubsScreen';
import { ClubDetailScreen } from '../screens/clubs/ClubDetailScreen';
import { TeamsScreen } from '../screens/teams/TeamsScreen';
import { DebriefScreen } from '../screens/debrief/DebriefScreen';
import { ShareScreen } from '../screens/share/ShareScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

const TAB_SCREENS: Record<TabId, () => React.ReactElement> = {
  profile: ProfileScreen,
  ranking: RankingScreen,
  challenges: ChallengesScreen,
  community: CommunityScreen,
  friends: FriendsScreen,
};

function renderRoute(r: Route) {
  switch (r.name) {
    case 'checkin':
      return <CheckInScreen />;
    case 'clubs':
      return <ClubsScreen />;
    case 'club':
      return <ClubDetailScreen clubId={r.clubId} />;
    case 'teams':
      return <TeamsScreen />;
    case 'debrief':
      return <DebriefScreen checkInId={r.checkInId} />;
    case 'user':
      return <UserScreen userId={r.userId} />;
    case 'share':
      return <ShareScreen />;
    case 'journal':
      return <JournalScreen />;
    case 'xpguide':
      return <XpGuideScreen />;
    case 'achievements':
      return <AchievementsScreen />;
  }
}

function routeKey(r: Route, i: number) {
  return `${i}-${r.name}-${'clubId' in r ? r.clubId : 'userId' in r ? r.userId : 'checkInId' in r ? r.checkInId : ''}`;
}

function Shell() {
  const { onboarded } = useGame();
  const { tab, stack } = useNav();

  if (!onboarded) return <OnboardingScreen />;
  const TabScreen = TAB_SCREENS[tab];

  return (
    <>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={tab} className="absolute inset-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
          <TabScreen />
        </motion.div>
      </AnimatePresence>
      <TabBar />
      <AnimatePresence>
        {stack.map((r, i) => (
          <div key={routeKey(r, i)} className="contents">
            {renderRoute(r)}
          </div>
        ))}
      </AnimatePresence>
      <GainOverlay />
    </>
  );
}

export function App() {
  return (
    <div className="stage">
      <div className="phone app-bg">
        <ToastProvider>
          <NavProvider>
            <GameProvider>
              <Shell />
            </GameProvider>
          </NavProvider>
        </ToastProvider>
      </div>
    </div>
  );
}
