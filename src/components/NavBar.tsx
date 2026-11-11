import { AppBar, Toolbar, Box, ButtonBase, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { figma } from '../theme';
import brandMark from '../assets/brand-mark.png';

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
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 72,
          height: 72,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {/* Brand + navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Brand */}
          <ButtonBase
            onClick={() => navigate('/feed')}
            aria-label="BuzzFed home"
            disableRipple
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
          >
            <Box
              component="img"
              src={brandMark}
              alt=""
              sx={{ width: 32, height: 32, display: 'block' }}
            />
            <Typography
              component="span"
              sx={{
                fontFamily: figma.headFont,
                fontSize: 30,
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

          {/* Primary navigation */}
          <Box
            component="nav"
            sx={{ display: 'flex', alignItems: 'center', gap: 3 }}
          >
            {items.map((item) => {
              const active = location.pathname === item.value;
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
                    gap: '6px',
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: figma.bodyFont,
                      fontSize: 16,
                      lineHeight: 'normal',
                      whiteSpace: 'nowrap',
                      fontWeight: active ? 600 : 400,
                      color: active ? figma.heading : figma.ink,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Box
                    sx={{
                      width: 28,
                      height: 2,
                      borderRadius: '1px',
                      bgcolor: active ? figma.heading : 'transparent',
                    }}
                  />
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
