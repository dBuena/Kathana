// Build Share System - Serializes and shares skill builds via URL

/**
 * Serialize the current build into a compact string format
 * Format: "mastery1:skillId1:level,skillId2:level|mastery2:skillId1:level,skillId2:level|..."
 * Uses skill IDs with colon separator to support skill IDs containing underscores
 */
function serializeBuild(character) {
  if (!character || !character.masteries) return '';

  const masteryNames = ['blade', 'archery', 'support', 'amara', 'god'];
  const parts = [];

  masteryNames.forEach(masteryName => {
    const mastery = character.masteries[masteryName];
    if (mastery && mastery.skills) {
      // Serialize as skillId:level pairs (colon separated to avoid conflicts with underscores in skill IDs)
      const levels = mastery.skills
        .filter(skill => skill.val > 0) // Only include non-zero values to reduce size
        .map(skill => `${skill.id}:${skill.val}`)
        .join(',');
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
 * Format: "mastery1:skillId1:level,skillId2:level|mastery2:..."
 * Uses skill IDs with colon separator to support skill IDs containing underscores
 */
function restoreBuild(character, decoded) {
  if (!decoded || !character || !character.masteries) return false;

  try {
    const masteryParts = decoded.split('|');
    let restored = false;

    masteryParts.forEach(part => {
      const colonIndex = part.indexOf(':');
      if (colonIndex === -1) return;

      const masteryName = part.substring(0, colonIndex);
      const skillsStr = part.substring(colonIndex + 1);
      const mastery = character.masteries[masteryName];

      if (mastery && mastery.skills && skillsStr) {
        // Parse skillId:level pairs (colon separated)
        const skillPairs = skillsStr.split(',');

        skillPairs.forEach(pair => {
          const lastColonIndex = pair.lastIndexOf(':');
          if (lastColonIndex === -1) return;

          const skillId = pair.substring(0, lastColonIndex);
          const levelStr = pair.substring(lastColonIndex + 1);
          const level = parseInt(levelStr) || 0;

          // Find the skill by ID and set its level
          const skill = mastery.skills.find(s => s.id === skillId);
          if (skill) {
            skill.val = Math.min(level, skill.max || 999);
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
