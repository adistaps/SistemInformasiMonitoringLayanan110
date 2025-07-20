
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Users, AlertTriangle, FileText } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Header from "@/components/Header";
import { useReportsStats } from "@/hooks/useReports";
import { useProfilesStats } from "@/hooks/useProfiles";

const Statistics = () => {
  const { data: reportsStats } = useReportsStats();
  const { data: profilesStats } = useProfilesStats();

  // Generate monthly data based on current stats (placeholder for now)
  const monthlyData = [
    { name: 'Jan', reports: 0 },
    { name: 'Feb', reports: 0 },
    { name: 'Mar', reports: 0 },
    { name: 'Apr', reports: 0 },
    { name: 'Mei', reports: 0 },
    { name: 'Jun', reports: reportsStats?.total || 0 },
  ];

  // Transform category data from database
  const categoryData = Object.entries(reportsStats?.byCategory || {}).map(([name, value], index) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
    const categoryNames: Record<string, string> = {
      'kecelakaan': 'Kecelakaan',
      'pencurian': 'Pencurian', 
      'kekerasan': 'Kekerasan',
      'penipuan': 'Penipuan',
      'lainnya': 'Lainnya'
    };
    
    return {
      name: categoryNames[name] || name,
      value: Math.round((value / (reportsStats?.total || 1)) * 100),
      count: value,
      color: colors[index % colors.length]
    };
  });

  // Mock response time data (can be enhanced later with real data)
  const responseTimeData = [
    { time: '00:00', avgTime: 0 },
    { time: '04:00', avgTime: 0 },
    { time: '08:00', avgTime: 0 },
    { time: '12:00', avgTime: 0 },
    { time: '16:00', avgTime: 0 },
    { time: '20:00', avgTime: 0 },
  ];

  // Transform status data from database
  const statusData = [
    { status: 'Selesai', count: reportsStats?.byStatus.selesai || 0, color: '#22c55e' },
    { status: 'Diproses', count: reportsStats?.byStatus.diproses || 0, color: '#3b82f6' },
    { status: 'Menunggu', count: reportsStats?.byStatus.menunggu || 0, color: '#eab308' },
    { status: 'Ditolak', count: reportsStats?.byStatus.ditolak || 0, color: '#ef4444' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1">
        <Header title="Statistics" />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistik dan Analisis</h1>
            <p className="text-gray-600">Dashboard analisis data SIMOLA 110 - POLDA Daerah Istimewa Yogyakarta</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Laporan</p>
                    <p className="text-3xl font-bold text-gray-900">{reportsStats?.total || 0}</p>
                    <p className="text-sm text-green-600 font-medium">Data real-time</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Avg Response Time</p>
                    <p className="text-3xl font-bold text-gray-900">-</p>
                    <p className="text-sm text-gray-600 font-medium">Akan segera tersedia</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Petugas</p>
                    <p className="text-3xl font-bold text-gray-900">{profilesStats?.total || 0}</p>
                    <p className="text-sm text-blue-600 font-medium">Terdaftar</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Kasus Darurat</p>
                    <p className="text-3xl font-bold text-gray-900">{reportsStats?.emergency || 0}</p>
                    <p className="text-sm text-red-600 font-medium">Perlu perhatian</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Reports Trend */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Tren Laporan Bulanan</CardTitle>
                <p className="text-sm text-gray-600">Jumlah laporan yang masuk setiap bulan</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }} 
                    />
                    <Bar dataKey="reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Distribusi Kategori</CardTitle>
                <p className="text-sm text-gray-600">Persentase jenis laporan yang diterima</p>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Belum ada data kategori</p>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row items-center">
                    <div className="w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            stroke="#ffffff"
                            strokeWidth={2}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-3">
                      {categoryData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="font-medium text-gray-700">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">{item.count}</span>
                            <p className="text-xs text-gray-500">({item.value}%)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Analysis */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Analisis Waktu Respon</CardTitle>
                <p className="text-sm text-gray-600">Rata-rata waktu respon berdasarkan jam dalam sehari</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">Data analisis waktu respon akan segera tersedia</p>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Distribusi Status Laporan</CardTitle>
                <p className="text-sm text-gray-600">Status dari semua laporan yang masuk</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="font-medium text-gray-700 text-lg">{item.status}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                        <p className="text-sm text-gray-500">Laporan</p>
                      </div>
                    </div>
                  ))}
                </div>
                {reportsStats?.total && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      💡 Tingkat penyelesaian: {((reportsStats.byStatus.selesai / reportsStats.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Statistics;
