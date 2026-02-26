// Build Share System - Serializes and shares skill builds via URL

/**
 * Serialize the current build into a compact string format
 * Format: "mastery1:skill1_level,skill2_level,skill3_level|mastery2:skill1_level,skill2_level|..."
 */
function serializeBuild(character) {
  if (!character || !character.masteries) return '';

  const masteryNames = ['blade', 'archery', 'support', 'amara', 'god'];
  const parts = [];

  masteryNames.forEach(masteryName => {
    const mastery = character.masteries[masteryName];
    if (mastery && mastery.skills) {
      const levels = mastery.skills.map(skill => skill.val || 0).join(',');
      parts.push(`${masteryName}:${levels}`);
    }
  });

  return parts.join('|');
}

/**
 * Encode serialized build to base64
 */
function encodeBuild(serialized) {
  if (!serialized) return '';
  try {
    return btoa(serialized);
  } catch (error) {
    console.error('Error encoding build:', error);
    return '';
  }
}

/**
 * Decode base64 build string
 */
function decodeBuild(encoded) {
  if (!encoded) return '';
  try {
    return atob(encoded);
  } catch (error) {
    console.error('Error decoding build:', error);
    return '';
  }
}

/**
 * Parse decoded build string and apply to character
 * Format: "mastery1:skill1_level,skill2_level,skill3_level|mastery2:..."
 */
function restoreBuild(character, decoded) {
  if (!decoded || !character || !character.masteries) return false;

  try {
    const masteryParts = decoded.split('|');
    let restored = false;

    masteryParts.forEach(part => {
      const [masteryName, levelsStr] = part.split(':');
      const mastery = character.masteries[masteryName];

      if (mastery && mastery.skills && levelsStr) {
        const levels = levelsStr.split(',').map(l => parseInt(l) || 0);

        // Apply levels to skills
        levels.forEach((level, index) => {
          if (mastery.skills[index]) {
            mastery.skills[index].val = Math.min(level, mastery.skills[index].max || 999);
            restored = true;
          }
        });
      }
    });

    return restored;
  } catch (error) {
    console.error('Error restoring build:', error);
    return false;
  }
}

/**
 * Generate shareable link for the current build
 * Returns a link to index.html with class and build parameters
 */
function generateShareLink(character, className) {
  if (!character || !className) return '';

  const serialized = serializeBuild(character);
  const encoded = encodeBuild(serialized);

  // Get the base path (remove any .html file from the URL)
  const currentPath = window.location.pathname;
  const basePath = currentPath.replace(/\/[^/]*\.html$/, '');
  const baseUrl = `${window.location.origin}${basePath}`;

  // Create share link pointing to index.html with class and build parameters
  const shareLink = `${baseUrl}/index.html?class=${className.toLowerCase()}&build=${encoded}`;

  return shareLink;
}

/**
 * Load build from URL query parameter on page load
 */
function loadBuildFromURL(character) {
  try {
    const params = new URLSearchParams(window.location.search);
    const buildParam = params.get('build');

    if (buildParam) {
      const decoded = decodeBuild(buildParam);
      if (decoded) {
        const restored = restoreBuild(character, decoded);
        if (restored) {
          console.log('Build loaded from URL successfully');
          return true;
        }
      }
    }
  } catch (error) {
    console.error('Error loading build from URL:', error);
  }

  return false;
}

/**
 * Update the share link display in the UI
 */
function updateShareLinkDisplay(shareLink) {
  const linkInput = document.getElementById('share-link-input');
  if (linkInput) {
    linkInput.value = shareLink;
  }
}

/**
 * Copy share link to clipboard with visual feedback
 */
function copyShareLink() {
  const linkInput = document.getElementById('share-link-input');
  const copyBtn = document.getElementById('copy-link-btn');

  if (linkInput && linkInput.value && copyBtn) {
    navigator.clipboard.writeText(linkInput.value).then(() => {
      // Add animation
      copyBtn.classList.add('animate', 'copied');

      // Store original state
      const originalHTML = copyBtn.innerHTML;
      const originalClasses = copyBtn.className;

      // Change button appearance and text
      copyBtn.textContent = '✓ Copied to Clipboard!';
      copyBtn.style.pointerEvents = 'none';

      // Revert after 2 seconds
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.className = originalClasses;
        copyBtn.style.pointerEvents = 'auto';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      copyBtn.textContent = '✗ Failed to Copy';
      copyBtn.style.background = '#e74c3c';

      setTimeout(() => {
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.style.background = '';
      }, 2000);
    });
  }
}

// Auto-update share link when page loads
document.addEventListener('DOMContentLoaded', () => {
  // This will be called by individual mastery files after they initialize
  console.log('Build Share system loaded');
});
