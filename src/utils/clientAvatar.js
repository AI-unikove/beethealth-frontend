import avatarMale from '@/assets/avatars/Avatar-Male.png'
import avatarFemale from '@/assets/avatars/Avatar-Female.png'
import avatarNeutral from '@/assets/avatars/avatar-neutral.svg'

export function normalizeClientGender(gender) {
  const g = String(gender ?? '')
    .trim()
    .toLowerCase()
  if (!g) return 'unknown'
  if (['female', 'f', 'woman', 'women', 'girl'].includes(g)) return 'female'
  if (['male', 'm', 'man', 'men', 'boy'].includes(g)) return 'male'
  return 'unknown'
}

export function getClientAvatarSrc(gender, customAvatarUrl) {
  const custom = customAvatarUrl != null && String(customAvatarUrl).trim()
  if (custom) return String(customAvatarUrl).trim()
  switch (normalizeClientGender(gender)) {
    case 'female':
      return avatarFemale
    case 'male':
      return avatarMale
    default:
      return avatarNeutral
  }
}
