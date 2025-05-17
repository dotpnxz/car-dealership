import { useMemo } from 'react';
import phLocations from './ph-locations.json';

const usePhLocations = () => {
  const regions = useMemo(() => Object.keys(phLocations), []);

  const getProvincesByRegion = useMemo(() => (region) => {
    return region ? Object.keys(phLocations[region]?.province_list || {}) : [];
  }, []);

  const getCitiesByProvince = useMemo(() => (province) => {
    for (const region in phLocations) {
      if (phLocations[region].province_list[province]) {
        return Object.keys(phLocations[region].province_list[province].municipality_list || {});
      }
    }
    return [];
  }, []);

  return {
    regions,
    getProvincesByRegion,
    getCitiesByProvince
  };
};

export default usePhLocations;