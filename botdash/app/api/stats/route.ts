import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const guildsSnap = await db.collection('guilds').get();
    if (guildsSnap.empty) {
      return NextResponse.json({ guilds: [], chart: [], totals: {} });
    }

    const guilds = guildsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const primaryGuildId = guilds[0].id;

    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const statsSnap = await db
      .collection('guilds')
      .doc(primaryGuildId)
      .collection('dailyStats')
      .where('date', 'in', last7Days)
      .get();

    const statsMap: Record<string, Record<string, number>> = {};
    statsSnap.docs.forEach((d) => {
      statsMap[d.id] = d.data() as Record<string, number>;
    });

    const chart = last7Days.map((date) => ({
      date: date.slice(5),
      messages: statsMap[date]?.messageCount || 0,
      joins: statsMap[date]?.memberJoins || 0,
      leaves: statsMap[date]?.memberLeaves || 0,
      voiceJoins: statsMap[date]?.voiceJoins || 0,
    }));

    const today = last7Days[6];
    const todayStats = statsMap[today] || {};

    return NextResponse.json({
      guilds,
      chart,
      totals: {
        members: guilds.reduce((s: number, g: Record<string, unknown>) => s + ((g.memberCount as number) || 0), 0),
        online: guilds.reduce((s: number, g: Record<string, unknown>) => s + ((g.onlineCount as number) || 0), 0),
        messagesToday: todayStats.messageCount || 0,
        joinsToday: todayStats.memberJoins || 0,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
