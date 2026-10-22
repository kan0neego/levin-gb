import { useEffect, useState } from "@wordpress/element";

import { fetchDoctor } from "@/lib/api/fetch-doctor";

/**
 * Живые данные врача по ID. Не пишет в атрибуты блока.
 *
 * @param {number|string} id ID записи типа `doctors`.
 * @return {Object} `doctor` и состояние запроса.
 */
export function useDoctor( id ) {
  const [ doctor, setDoctor ] = useState( null );
  const [ isResolving, setIsResolving ] = useState( false );

  useEffect( () => {
    if ( ! id ) {
      setDoctor( null );
      setIsResolving( false );
      return undefined;
    }

    let isActual = true;

    setIsResolving( true );

    fetchDoctor( id )
      .then( ( record ) => {
        if ( isActual ) {
          setDoctor( record || null );
        }
      } )
      .catch( () => {
        if ( isActual ) {
          setDoctor( null );
        }
      } )
      .finally( () => {
        if ( isActual ) {
          setIsResolving( false );
        }
      } );

    return () => {
      isActual = false;
    };
  }, [ id ] );

  return { doctor, isResolving };
}
