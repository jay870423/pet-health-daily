import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ActivityMapBaidu.css';

// 加载百度地图脚本
const loadBaiduMapScript = (ak) => {
  return new Promise((resolve, reject) => {
    // 检查是否已加载（普通版或WebGL版）
    if (window.BMap || window.BMapGL) {
      console.log('百度地图已加载');
      resolve(window.BMap || window.BMapGL);
      return;
    }

    console.log('开始加载百度地图脚本, AK:', ak);
    
    // 使用普通版JavaScript API（更稳定，不依赖WebGL和Worker）
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `//api.map.baidu.com/api?v=3.0&ak=${ak}&callback=onBMapCallback`;
    
    script.onerror = (error) => {
      console.error('百度地图脚本加载失败:', error);
      reject(new Error('百度地图脚本加载失败，请检查网络连接'));
    };
    
    window.onBMapCallback = function() {
      console.log('百度地图脚本加载成功');
      if (window.BMap) {
        resolve(window.BMap);
      } else {
        console.error('BMap对象未定义');
        reject(new Error('BMap对象未定义'));
      }
    };
    
    // 设置超时
    setTimeout(() => {
      if (!window.BMap) {
        console.error('百度地图加载超时');
        reject(new Error('百度地图加载超时，请检查AK配置和网络'));
      }
    }, 10000);
    
    document.head.appendChild(script);
  });
};

function ActivityMapBaidu({ petId, date }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackData, setTrackData] = useState(null);
  const [mapConfig, setMapConfig] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 获取地图配置
  useEffect(() => {
    fetchMapConfig();
  }, []);

  // 加载地图和轨迹
  useEffect(() => {
    if (mapConfig && petId && date) {
      loadMapAndTrack();
    }
  }, [mapConfig, petId, date]);

  const fetchMapConfig = async () => {
    try {
      const response = await axios.get('/api/location/config');
      if (response.data.success) {
        setMapConfig(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch map config:', err);
      setError('地图配置加载失败');
    }
  };

  const loadMapAndTrack = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('百度地图AK:', mapConfig.baiduMapAk);
      
      // 加载百度地图脚本
      await loadBaiduMapScript(mapConfig.baiduMapAk);

      // 获取轨迹数据
      const response = await axios.get(`/api/location/track/${petId}`, {
        params: { date, simplify: true }
      });

      if (response.data.success) {
        const data = response.data.data;
        setTrackData(data);

        // 初始化地图
        if (data.track.length > 0) {
          initMap(data.track);
        } else {
          setError('当日暂无轨迹数据');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Load map error:', err);
      const errorMsg = err.message || '加载失败';
      
      // 针对百度地图AK错误的特殊提示
      if (errorMsg.includes('ak') || errorMsg.includes('AK') || errorMsg.includes('Invalid')) {
        setError('百度地图AK验证失败。可能原因：\n1. Referer白名单未包含localhost\n2. 应用类型应设置为"浏览器端"\n3. IP白名单限制\n\n建议：在百度地图控制台的Referer配置中确认已添加 *');
      } else {
        setError(errorMsg);
      }
      setLoading(false);
    }
  };

  const initMap = (track) => {
    if (!mapRef.current) {
      console.error('地图容器不存在');
      setError('地图容器不存在');
      setLoading(false);
      return;
    }
    
    if (!window.BMap) {
      console.error('BMap未加载');
      setError('百度地图API未加载');
      setLoading(false);
      return;
    }

    try {
      console.log('开始初始化地图，轨迹点数:', track.length);
      console.log('第一个点:', track[0]);
      
      // 清除旧的地图实例
      if (mapInstance.current) {
        console.log('清除旧地图实例');
        mapInstance.current.clearOverlays();
        mapInstance.current = null;
      }
      
      // 创建新的地图实例
      const map = new window.BMap.Map(mapRef.current);
      mapInstance.current = map;

      // 设置地图中心点和初始缩放级别
      const centerPoint = new window.BMap.Point(track[0].lng, track[0].lat);
      map.centerAndZoom(centerPoint, 15);

      // 设置地图类型为普通街道地图
      map.setMapType(window.BMAP_NORMAL_MAP);

      // 启用鼠标滚轮缩放
      map.enableScrollWheelZoom(true);
      
      // 启用连续缩放
      map.enableContinuousZoom(true);
      
      // 启用惯性拖拽
      map.enableInertialDragging(true);

      // 添加缩放和平移控件
      map.addControl(new window.BMap.NavigationControl({
        anchor: window.BMAP_ANCHOR_TOP_RIGHT,
        type: window.BMAP_NAVIGATION_CONTROL_SMALL
      }));
      map.addControl(new window.BMap.ScaleControl({
        anchor: window.BMAP_ANCHOR_BOTTOM_LEFT
      }));
      
      // 添加地图类型控件
      map.addControl(new window.BMap.MapTypeControl({
        mapTypes: [window.BMAP_NORMAL_MAP, window.BMAP_HYBRID_MAP]
      }));

      // 绘制轨迹
      drawTrack(map, track);

      // 自动调整视野以完整显示轨迹
      const points = track.map(point => new window.BMap.Point(point.lng, point.lat));
      
      // 延迟一下再设置视野，确保地图完全初始化
      setTimeout(() => {
        try {
          map.setViewport(points);
          console.log('地图视野已调整');
        } catch (e) {
          console.warn('设置视野失败:', e);
        }
      }, 200);

      console.log('地图初始化成功');
      setLoading(false);
    } catch (err) {
      console.error('地图初始化失败:', err);
      console.error('错误详情:', err.message, err.stack);
      setError(`地图初始化失败: ${err.message}`);
      setLoading(false);
    }
  };

  // 安全的Base64编码（支持中文）
  const encodeSvg = (svg) => {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };

  const drawTrack = (map, track) => {
    if (!track || track.length === 0) return;

    console.log('开始绘制轨迹，点数:', track.length);

    // 创建轨迹点数组
    const points = track.map(point => 
      new window.BMap.Point(point.lng, point.lat)
    );

    console.log('轨迹点:', points.length);

    // 绘制轨迹背景线（白色描边）
    const outlinePolyline = new window.BMap.Polyline(points, {
      strokeColor: 'white',
      strokeWeight: 8,
      strokeOpacity: 0.9
    });
    map.addOverlay(outlinePolyline);

    // 绘制轨迹主线（紫色）
    const polyline = new window.BMap.Polyline(points, {
      strokeColor: '#667eea',
      strokeWeight: 5,
      strokeOpacity: 1
    });
    map.addOverlay(polyline);

    console.log('轨迹线已添加');

    // 添加起点标记
    const startPoint = points[0];
    const startMarker = new window.BMap.Marker(startPoint, {
      icon: new window.BMap.Icon(
        encodeSvg(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <circle cx="16" cy="16" r="12" fill="#27ae60" stroke="#fff" stroke-width="3"/>
            <text x="16" y="21" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">起</text>
          </svg>
        `),
        new window.BMap.Size(32, 32)
      )
    });
    map.addOverlay(startMarker);

    // 添加起点信息窗口
    const startInfo = new window.BMap.InfoWindow(`
      <div style="padding: 10px; font-size: 13px;">
        <strong style="color: #27ae60;">起点</strong><br/>
        <span style="color: #666;">时间: ${track[0].time}</span><br/>
        <span style="color: #666;">步数: ${track[0].step}</span>
      </div>
    `, {
      width: 200,
      height: 80,
      title: '轨迹起点'
    });

    startMarker.addEventListener('click', function() {
      map.openInfoWindow(startInfo, startPoint);
    });

    // 添加终点标记
    const endPoint = points[points.length - 1];
    const endMarker = new window.BMap.Marker(endPoint, {
      icon: new window.BMap.Icon(
        encodeSvg(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <circle cx="16" cy="16" r="12" fill="#e74c3c" stroke="#fff" stroke-width="3"/>
            <text x="16" y="21" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">终</text>
          </svg>
        `),
        new window.BMap.Size(32, 32)
      )
    });
    map.addOverlay(endMarker);

    // 添加终点信息窗口
    const endInfo = new window.BMap.InfoWindow(`
      <div style="padding: 10px; font-size: 13px;">
        <strong style="color: #e74c3c;">终点</strong><br/>
        <span style="color: #666;">时间: ${track[track.length - 1].time}</span><br/>
        <span style="color: #666;">步数: ${track[track.length - 1].step}</span>
      </div>
    `, {
      width: 200,
      height: 80,
      title: '轨迹终点'
    });

    endMarker.addEventListener('click', function() {
      map.openInfoWindow(endInfo, endPoint);
    });

    // 添加轨迹点标记（只在轨迹较长时显示中间点）
    if (track.length > 5) {
      const interval = Math.max(1, Math.floor(track.length / 8));
      for (let i = interval; i < track.length - 1; i += interval) {
        const point = new window.BMap.Point(track[i].lng, track[i].lat);
        const marker = new window.BMap.Marker(point, {
          icon: new window.BMap.Icon(
            encodeSvg(`
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
                <circle cx="6" cy="6" r="4" fill="#667eea" stroke="#fff" stroke-width="2"/>
              </svg>
            `),
            new window.BMap.Size(12, 12)
          )
        });

        // 添加点击事件
        const infoWindow = new window.BMap.InfoWindow(`
          <div style="padding: 10px; font-size: 12px;">
            <span style="color: #666;">时间: ${track[i].time}</span><br/>
            <span style="color: #666;">步数: ${track[i].step}</span><br/>
            <span style="color: #666;">定位精度: ${track[i].radius ? track[i].radius.toFixed(1) + 'm' : 'N/A'}</span>
          </div>
        `, {
          width: 180,
          height: 70
        });

        marker.addEventListener('click', function() {
          map.openInfoWindow(infoWindow, point);
        });

        map.addOverlay(marker);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMapAndTrack().finally(() => {
      setTimeout(() => setRefreshing(false), 1000);
    });
  };

  return (
    <div className="activity-map-baidu card">
      {/* 头部 */}
      <div className="map-header">
        <div className="header-left">
          <h3 className="card-title">🗺️ 活动轨迹地图</h3>
          <span className="map-provider">百度地图</span>
        </div>
        <div className="header-actions">
          <button 
            className="toggle-stats-btn"
            onClick={() => setShowStats(!showStats)}
            title={showStats ? '隐藏统计' : '显示统计'}
          >
            {showStats ? '📊' : '📈'}
          </button>
          <button 
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={loading || refreshing}
            title="刷新轨迹"
          >
            🔄
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      {trackData && showStats && (
        <div className="track-stats">
          <div className="stat-item">
            <span className="stat-icon">📏</span>
            <div className="stat-content">
              <div className="stat-value">{trackData.stats.totalDistance}m</div>
              <div className="stat-label">总距离</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <div className="stat-content">
              <div className="stat-value">{trackData.stats.totalActiveTime || trackData.stats.duration}min</div>
              <div className="stat-label">活动时长</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⚡</span>
            <div className="stat-content">
              <div className="stat-value">{trackData.stats.avgSpeed ? trackData.stats.avgSpeed.toFixed(1) : '0.0'}m/s</div>
              <div className="stat-label">平均速度</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📍</span>
            <div className="stat-content">
              <div className="stat-value">{trackData.pointCount}</div>
              <div className="stat-label">轨迹点</div>
            </div>
          </div>
          {trackData.stats.totalWalkTime > 0 && (
            <div className="stat-item">
              <span className="stat-icon">🚶</span>
              <div className="stat-content">
                <div className="stat-value">{trackData.stats.totalWalkTime}min</div>
                <div className="stat-label">走路</div>
              </div>
            </div>
          )}
          {trackData.stats.totalJogTime > 0 && (
            <div className="stat-item">
              <span className="stat-icon">🏃</span>
              <div className="stat-content">
                <div className="stat-value">{trackData.stats.totalJogTime}min</div>
                <div className="stat-label">快走</div>
              </div>
            </div>
          )}
          {trackData.stats.totalRunTime > 0 && (
            <div className="stat-item">
              <span className="stat-icon">💨</span>
              <div className="stat-content">
                <div className="stat-value">{trackData.stats.totalRunTime}min</div>
                <div className="stat-label">跑步</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 地图容器 */}
      <div className="map-wrapper">
        {loading && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>加载地图中...</p>
          </div>
        )}

        {error && (
          <div className="map-error">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={loadMapAndTrack} className="retry-btn">
              重试
            </button>
          </div>
        )}

        <div 
          ref={mapRef} 
          className="baidu-map-container"
          style={{ display: loading || error ? 'none' : 'block' }}
        ></div>
      </div>

      {/* 图例 */}
      {trackData && !loading && !error && (
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-icon start-icon"></div>
            <span>起点</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon end-icon"></div>
            <span>终点</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon track-icon"></div>
            <span>轨迹</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityMapBaidu;
