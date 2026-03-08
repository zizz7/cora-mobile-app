/**
 * FeedCard — Individual feed item component.
 */
import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Modal,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import type { FeedItem } from '../types/feed';
import { theme } from '../theme/theme';
import { useTranslate } from '../hooks/useMentions';

interface FeedCardProps {
  item: FeedItem;
  onDoubleTap: () => void;
  onPress: () => void;
  onJoinTrip?: (referenceId: string) => void;
}

const getSourceColor = (source: string) => {
  switch (source) {
    case 'tripadvisor': return theme.colors.teal;
    case 'booking': return '#003580';
    case 'agoda': return '#FF4A00';
    case 'google': return '#EA4335';
    case 'holidaycheck': return '#FF6600';
    case 'staff':
    case 'event': return '#A855F7';
    default: return '#0066CC';
  }
};

const SourceIcon = ({ source, size = 18, color = '#fff' }: { source: string, size?: number, color?: string }) => {
  switch (source) {
    case 'tripadvisor': return <FontAwesome5 name="tripadvisor" size={size} color={color} />;
    case 'booking': return <Text style={{ color, fontWeight: '800', fontSize: size }}>B.</Text>;
    case 'agoda': return <Text style={{ color, fontWeight: '800', fontSize: size }}>ag</Text>;
    case 'google': return <FontAwesome5 name="google" size={size} color={color} />;
    case 'holidaycheck': return <FontAwesome5 name="umbrella-beach" size={size} color={color} />;
    case 'event': return <MaterialCommunityIcons name="calendar-star" size={size} color={color} />;
    default: return <MaterialCommunityIcons name="account" size={size} color={color} />;
  }
};

export function FeedCard({ item, onDoubleTap, onPress, onJoinTrip }: FeedCardProps) {
  const { width } = useWindowDimensions();
  const [lastTap, setLastTap] = useState<number | null>(null);
  const [showHeart, setShowHeart] = useState(false);

  const isExternal = item.type === 'external_review';
  const isEvent = item.subtype === 'event' || (item.body && item.body.startsWith('New Event:'));
  const isTrip = item.subtype === 'trip' || (item.body && item.body.startsWith('New Trip:'));
  const isMention = item.subtype === 'mention' || (item.body && item.body.includes('TripAdvisor Mentions logged'));

  const sourceColor = getSourceColor(item.subtype);

  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const { mutate: translateText, isPending: isTranslating } = useTranslate();

  const handleTranslate = () => {
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    translateText(item.body || '', {
      onSuccess: (data: any) => {
        if (data?.translated_text) {
          setTranslatedText(data.translated_text);
        } else if (data?.error) {
          alert(data.error);
        }
      },
      onError: () => alert('Failed to translate text.')
    });
  };

  const handleTap = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      // Double tap detected
      onDoubleTap();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
      setLastTap(null);
    } else {
      setLastTap(now);
      // Single tap after delay
      setTimeout(() => {
        if (lastTap === now) {
          onPress();
        }
      }, 300);
    }
  };

  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  const renderMediaGrid = () => {
    if (!item.media_urls?.length) return null;

    const images = item.media_urls.slice(0, 4);
    const remaining = item.media_urls.length - 4;

    if (images.length === 1) {
      return (
        <TouchableOpacity onPress={() => openLightbox(0)} activeOpacity={0.9}>
          <Image
            source={{ uri: images[0] }}
            style={[styles.singleImage, { width: width - 80 }]}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.imageGrid}>
        {images.map((url, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => openLightbox(idx)}
            activeOpacity={0.9}
            style={[
              styles.gridImage,
              { width: (width - 90) / 2, height: (width - 90) / 2 },
            ]}
          >
            <Image source={{ uri: url }} style={styles.gridImageInner} resizeMode="cover" />
            {idx === 3 && remaining > 0 && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{remaining}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderLightbox = () => {
    if (!item.media_urls?.length) return null;
    const screenW = Dimensions.get('window').width;
    const screenH = Dimensions.get('window').height;

    return (
      <Modal visible={lightboxVisible} transparent animationType="fade">
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <View style={styles.lightboxContainer}>
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightboxVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.lightboxCounter}>{lightboxIndex + 1} / {item.media_urls.length}</Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: lightboxIndex * screenW, y: 0 }}
            onMomentumScrollEnd={(e) => {
              const newIdx = Math.round(e.nativeEvent.contentOffset.x / screenW);
              setLightboxIndex(newIdx);
            }}
          >
            {item.media_urls.map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: url }}
                style={{ width: screenW, height: screenH * 0.75 }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderRatingDots = (rating: number | undefined) => {
    if (!rating) return null;
    // Assume rating is out of 10 or 5. Let's normalize to 5 dots for visual consistency.
    const normalized = rating > 5 ? Math.round(rating / 2) : Math.round(rating);
    return (
      <View style={{ flexDirection: 'row', marginTop: 6, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={{
            width: 14, height: 14, borderRadius: 7,
            backgroundColor: i <= normalized ? theme.colors.teal : '#E5E7EB',
            marginRight: 4
          }} />
        ))}
      </View>
    );
  };

  const renderTripCard = () => {
    const lines = (item.body || '').split('\n');
    let title = '', departure = '', returnDate = '', location = '';
    lines.forEach(line => {
      const t = line.trim();
      if (t.startsWith('New Trip:')) title = t.replace('New Trip:', '').trim();
      else if (t.startsWith('Departure:')) departure = t.replace('Departure:', '').trim();
      else if (t.startsWith('Return:')) returnDate = t.replace('Return:', '').trim();
      else if (t.startsWith('Location:')) location = t.replace('Location:', '').trim();
    });

    return (
      <View style={[styles.tripContainer, { padding: 0, flexDirection: 'row', overflow: 'hidden' }]}>
        <View style={{ width: 6, backgroundColor: theme.colors.teal }} />
        <View style={{ flex: 1, padding: 16 }}>
          <View style={styles.tripBadge}>
            <Ionicons name="airplane" size={12} color={theme.colors.teal} style={{ marginRight: 4 }} />
            <Text style={styles.tripBadgeText}>TRIP</Text>
          </View>
          <Text style={styles.tripTitle}>{title || item.title}</Text>

          <View style={styles.tripDetailsRow}>
            <View style={[styles.tripDetailBox, { minWidth: 0 }]}>
              <View style={styles.tripDetailIcon}>
                <MaterialCommunityIcons name="calendar-blank" size={16} color={theme.colors.textSecondary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.tripDetailLabel}>DEPARTURE</Text>
                <Text style={styles.tripDetailValue} numberOfLines={2}>{departure}</Text>
              </View>
            </View>
            <View style={[styles.tripDetailBox, { minWidth: 0 }]}>
              <View style={styles.tripDetailIcon}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textSecondary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.tripDetailLabel}>RETURN</Text>
                <Text style={styles.tripDetailValue} numberOfLines={2}>{returnDate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tripLocationBox}>
            <View style={styles.tripDetailIcon}>
              <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.tripDetailLabel}>LOCATION</Text>
              <Text style={styles.tripDetailValue}>{location}</Text>
            </View>
          </View>

          {item.is_joinable && (
            <View style={styles.tripActionContainer}>
              {item.has_joined ? (
                <View style={styles.tripJoinedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.teal} style={{ marginRight: 6 }} />
                  <Text style={styles.tripJoinedText}>Already Joined</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.tripSlotsText}>✓ Slots available</Text>
                  <TouchableOpacity
                    style={styles.tripJoinButton}
                    onPress={() => {
                      if (onJoinTrip && item.reference_id) {
                        onJoinTrip(item.reference_id);
                      }
                    }}
                  >
                    <MaterialCommunityIcons name="account-plus" size={18} color={theme.colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.tripJoinText}>Join Trip</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderMentionCard = () => {
    const meta = item.meta as any;

    // Prefer structured leaderboard data from meta (contains ALL employees)
    // Fall back to parsing body text for older posts
    let parsedMentions: { raw: string; name: string; dept: string; count: number }[];

    if (meta?.leaderboard && Array.isArray(meta.leaderboard) && meta.leaderboard.length > 0) {
      parsedMentions = meta.leaderboard.map((entry: any) => ({
        raw: `${entry.name} (${entry.department}): ${entry.mention_count} mentions`,
        name: entry.name,
        dept: entry.department || '',
        count: entry.mention_count,
      }));
    } else {
      const lines = (item.body || '').split('\n');
      const mentionLines = lines.slice(1).filter(l => l.trim().startsWith('-'));
      parsedMentions = mentionLines.map(m => {
        const text = m.replace('-', '').trim();
        const nameMatch = text.match(/^(.+?)\s*\((.+?)\):\s*(\d+)\s*mentions?/);
        return {
          raw: text,
          name: nameMatch ? nameMatch[1].trim() : text,
          dept: nameMatch ? nameMatch[2] : '',
          count: nameMatch ? parseInt(nameMatch[3], 10) : 0,
        };
      });
    }

    const totalEmployees = meta?.total_employees || parsedMentions.length;
    const totalMentions = meta?.total_mentions || parsedMentions.reduce((sum, m) => sum + m.count, 0);
    const maxCount = parsedMentions.length > 0 ? parsedMentions[0].count : 1;

    // Extract title/date range info
    const periodLabel = meta?.period_label || '';
    const dateRange = periodLabel || (item.body || '').split('\n')[0].replace(/TripAdvisor Mentions logged for\s*/i, '').replace(/:$/, '');

    // Render dots (like the web): green for top 3, light blue for rest
    const renderDots = (count: number, isTop3: boolean) => {
      const maxDots = 6;
      const filledDots = Math.max(1, Math.round((count / maxCount) * maxDots));
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
          {Array.from({ length: maxDots }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i < filledDots
                  ? (isTop3 ? theme.colors.teal : '#93C5FD')
                  : '#E5E7EB',
                marginRight: 3,
              }}
            />
          ))}
        </View>
      );
    };

    const headerTitle = 'Top-Rated Freedom Fighters at Cora Cora Maldives';

    return (
      <View style={styles.mentionContainer}>
        {/* Green Header Banner (matching web) */}
        <View style={styles.mentionBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
            <FontAwesome5 name="tripadvisor" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.mentionBannerTitle}>{headerTitle}</Text>
          </View>
          <Text style={styles.mentionBannerDate}>{dateRange}</Text>
        </View>

        {/* Scrollable Ranked List */}
        <ScrollView
          style={styles.mentionScrollList}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {parsedMentions.map((mention, idx) => {
            const isTop3 = idx < 3;
            return (
              <View key={idx} style={styles.mentionRow}>
                <Text style={[
                  styles.mentionRankNum,
                  isTop3 && { color: theme.colors.teal, fontWeight: '900' }
                ]}>
                  {idx + 1}
                </Text>
                <View style={styles.mentionInfo}>
                  <Text style={styles.mentionName} numberOfLines={1}>
                    {mention.name}
                    {mention.dept ? (
                      <Text style={styles.mentionDeptInline}>{` (${mention.dept})`}</Text>
                    ) : null}
                  </Text>
                </View>
                {renderDots(mention.count, isTop3)}
                <Text style={[
                  styles.mentionCountNum,
                  isTop3 && { color: theme.colors.teal }
                ]}>
                  {mention.count}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Footer Stats */}
        <View style={styles.mentionFooter}>
          <View style={styles.mentionFooterItem}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.mentionFooterText}>{totalEmployees} employees</Text>
          </View>
          <View style={styles.mentionFooterItem}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.mentionFooterText}>{totalMentions} total mentions</Text>
          </View>
        </View>
      </View>
    );
  };

  // Special Purple Card for Events
  if (isEvent) {
    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: '#A855F7', borderWidth: 0 }]} onPress={handleTap} activeOpacity={0.95}>
        <View style={styles.eventHeader}>
          <View style={styles.eventIconContainer}>
            <MaterialCommunityIcons name="calendar-month" size={24} color="#A855F7" />
          </View>
          <View style={styles.eventTitles}>
            <Text style={styles.eventSubtitle}>TODAY'S ACTIVITY</Text>
            <Text style={styles.eventTitle}>{item.title || item.body.substring(0, 30).toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.eventMetaRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <Ionicons name="location-outline" size={14} color="#fff" />
            <Text style={styles.eventMetaText}>Location TBA</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <Ionicons name="time-outline" size={14} color="#fff" />
            <Text style={styles.eventMetaText}>All Day</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={14} color="#fff" />
            <Text style={styles.eventMetaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        {showHeart && (
          <View style={styles.heartOverlay}>
            <Text style={styles.bigHeart}>❤️</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handleTap} activeOpacity={0.95}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          {!isExternal && (
            <View style={[styles.avatar, { backgroundColor: sourceColor }]}>
              {item.author.avatar_url ? (
                <Image source={{ uri: item.author.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitial}>
                  {item.author.name?.charAt(0)?.toUpperCase()}
                </Text>
              )}
            </View>
          )}
          {isExternal && item.author.avatar_url && (
            <Image source={{ uri: item.author.avatar_url }} style={[styles.avatar, { borderRadius: 22, marginRight: 12 }]} />
          )}

          <View style={styles.authorText}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.authorName} numberOfLines={1}>
                {item.author.name}
              </Text>
              {isExternal && (
                <View style={[styles.sourceBadge, { backgroundColor: sourceColor }]}>
                  <SourceIcon source={item.subtype} size={10} color="#fff" />
                  <Text style={styles.sourceBadgeText}>{item.subtype.charAt(0).toUpperCase() + item.subtype.slice(1)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.authorMeta}>
              {isExternal ? formatDate(item.created_at) : (item.author.department || 'Staff' + ' • ' + formatDate(item.created_at))}
            </Text>
          </View>
        </View>
        {item.is_pinned && (
          <View style={styles.pinnedBadge}>
            <MaterialCommunityIcons name="pin" size={14} color="#92400E" />
          </View>
        )}
      </View>

      {/* Content */}
      {isExternal && renderRatingDots(item.rating)}

      {item.title && !(isTrip || isMention) && (
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      )}

      {isTrip ? renderTripCard() : isMention ? renderMentionCard() : (
        <View style={{ marginBottom: isExternal ? 12 : 0 }}>
          <Text style={styles.body} numberOfLines={translatedText ? undefined : 6}>
            {translatedText ? `"${translatedText}"` : item.body}
          </Text>
          {isExternal && (
            <TouchableOpacity
              style={styles.translateBtn}
              onPress={handleTranslate}
              disabled={isTranslating}
            >
              {isTranslating ? (
                <ActivityIndicator size="small" color={theme.colors.teal} />
              ) : (
                <>
                  <MaterialCommunityIcons name="translate" size={16} color={theme.colors.teal} />
                  <Text style={styles.translateText}>
                    {translatedText ? 'Show Original' : 'Translate to English'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Media Grid */}
      {renderMediaGrid()}

      {/* Reactions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.reactions} onPress={() => handleTap()}>
          <Ionicons name={item.has_reacted ? "heart" : "heart-outline"} size={20} color={item.has_reacted ? "#EF4444" : "#6B7280"} />
          <Text style={[styles.reactionCount, item.has_reacted && { color: '#EF4444' }]}>{item.reactions_count || 0}</Text>
        </TouchableOpacity>
      </View>

      {/* Double-tap heart overlay */}
      {showHeart && (
        <View style={styles.heartOverlay}>
          <Text style={styles.bigHeart}>❤️</Text>
        </View>
      )}

      {/* Full-Screen Image Lightbox */}
      {renderLightbox()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  authorText: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  authorMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  sourceBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  pinnedBadge: {
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.transparent.teal10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  translateText: {
    color: theme.colors.teal,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Event Styles
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventTitles: {
    flex: 1,
    justifyContent: 'center',
  },
  eventSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  eventMetaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  singleImage: {
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 12,
  },
  gridImage: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImageInner: {
    width: '100%',
    height: '100%',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  reactedBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reactedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  bigHeart: {
    fontSize: 80,
  },
  // Trip Formatting
  tripContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16,
    marginTop: 8,
  },
  tripBadge: {
    backgroundColor: theme.colors.transparent.teal10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  tripBadgeText: {
    color: theme.colors.teal,
    fontFamily: theme.fonts.label,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tripTitle: {
    fontFamily: theme.fonts.headingM,
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  tripDetailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tripDetailBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripLocationBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripDetailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tripDetailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tripDetailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  tripActionContainer: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  tripSlotsText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  tripJoinButton: {
    backgroundColor: theme.colors.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  tripJoinText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  tripJoinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    backgroundColor: '#E6F7F3',
    borderWidth: 1,
    borderColor: theme.colors.teal,
  },
  tripJoinedText: {
    color: theme.colors.teal,
    fontSize: 15,
    fontWeight: '700',
  },
  mentionContainer: {
    marginTop: 8,
  },
  mentionBanner: {
    backgroundColor: theme.colors.teal,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  mentionBannerTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
  mentionBannerDate: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  mentionScrollList: {
    maxHeight: 400,
  },
  mentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mentionRankNum: {
    width: 24,
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  mentionInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },
  mentionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  mentionDeptInline: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  mentionCountNum: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B7280',
    marginLeft: 8,
    minWidth: 24,
    textAlign: 'right',
  },
  mentionFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 24,
  },
  mentionFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mentionFooterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Lightbox
  lightboxContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: 54,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxCounter: {
    position: 'absolute',
    top: 62,
    left: 20,
    zIndex: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
