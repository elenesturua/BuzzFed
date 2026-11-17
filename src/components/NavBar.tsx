import { AppBar, Toolbar, Box, ButtonBase, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { figma } from '../theme';
import brandMark from '../assets/brand-mark.png';

export const NAV_HEIGHT_MOBILE = 56;
export const NAV_HEIGHT_DESKTOP = 72;

const items = [
  { label: 'Feed', value: '/feed' },
  { label: 'Post', value: '/post' },
  { label: 'Map', value: '/map' },
  { label: 'Profile', value: '/profile' },
];

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        color: figma.ink,
        borderBottom: `4px solid ${figma.cardBorder}`,
        backgroundColor: figma.pageBg,
        backgroundImage: `linear-gradient(180deg, ${figma.navBand} 0%, rgba(165,216,255,0) 42%, rgba(165,216,255,0) 58%, ${figma.navBand} 100%), repeating-linear-gradient(90deg, ${figma.navBand} 0px, ${figma.navBand} 26px, rgba(165,216,255,0) 26px, rgba(165,216,255,0) 58px)`,
        pt: 'env(safe-area-inset-top)',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: { xs: NAV_HEIGHT_MOBILE, sm: NAV_HEIGHT_DESKTOP },
          height: { xs: NAV_HEIGHT_MOBILE, sm: NAV_HEIGHT_DESKTOP },
          px: { xs: 1.25, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 4 },
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <ButtonBase
          onClick={() => navigate('/feed')}
          aria-label="BuzzFed home"
          disableRipple
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.75, sm: 1.5 },
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src={brandMark}
            alt=""
            sx={{
              width: { xs: 26, sm: 32 },
              height: { xs: 26, sm: 32 },
              display: 'block',
            }}
          />
          <Typography
            component="span"
            sx={{
              fontSize: { xs: 18, sm: 30 },
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            <Box component="span" sx={{ color: figma.brandBlue }}>
              BUZZ
            </Box>
            <Box component="span" sx={{ color: figma.heading }}>
              FED
            </Box>
          </Typography>
        </ButtonBase>

        <Box
          component="nav"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
            gap: { xs: 0.25, sm: 3 },
            flex: 1,
            minWidth: 0,
          }}
        >
          {items.map((item) => {
            const active =
              location.pathname === item.value ||
              (item.value === '/post' && location.pathname.startsWith('/post/'));
            return (
              <ButtonBase
                key={item.value}
                onClick={() => navigate(item.value)}
                disableRipple
                aria-current={active ? 'page' : undefined}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: { xs: '3px', sm: '6px' },
                  flex: { xs: 1, sm: '0 0 auto' },
                  minWidth: 0,
                  px: { xs: 0.25, sm: 0 },
                  py: 0.5,
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: { xs: 13, sm: 16 },
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    fontWeight: active ? 600 : 400,
                    color: active ? figma.brandBlue : figma.ink,
                  }}
                >
                  {item.label}
                </Typography>
                <Box
                  sx={{
                    width: { xs: 22, sm: 28 },
                    height: 2,
                    borderRadius: '1px',
                    bgcolor: active ? figma.brandBlue : 'transparent',
                  }}
                />
              </ButtonBase>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
