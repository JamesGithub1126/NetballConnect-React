import React, { useEffect } from 'react';
import { isEqual } from 'lodash';
import { isArrayNotEmpty } from '../util/helpers';
import { useSelector } from 'react-redux';
import { getOrganisationData } from '../util/sessionStorage';

function Tawk() {
  const { allUserOrganisationData } = useSelector(state => state.UserState);

  useEffect(() => {
    if (localStorage.token && isArrayNotEmpty(allUserOrganisationData)) {
      let organisationData = getOrganisationData();
      const findOrganisation = allUserOrganisationData.find(
        item => item.organisationId === getOrganisationData()?.organisationId,
      );
      if (!findOrganisation || !getOrganisationData()) {
        organisationData = allUserOrganisationData[0];
      } else if (!isEqual(getOrganisationData(), findOrganisation)) {
        organisationData = findOrganisation;
      }
      const userData = {
        name: organisationData
          ? organisationData.firstName +
            ' ' +
            organisationData.lastName +
            ' | ' +
            organisationData.name
          : '',
        email: organisationData ? organisationData.userEmail : '',
      };
      const stateTawkProperty = organisationData?.stateTawkProperty;

      /*  if (getSignDate() && Date.now() - localStorage.signDate > 60 * 60 * 24 * 1000) {
              removeSignDate();
            } */
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();
      (function () {
        var s1 = document.createElement('script'),
          s0 = document.getElementsByTagName('script')[0];
        s1.async = true;
        s1.src = `https://embed.tawk.to/${
          stateTawkProperty || process.env.REACT_APP_DEFAULT_TAWK_PROPERTY
        }`;
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode.insertBefore(s1, s0);
      })();
      if (window.Tawk_API.onLoaded) {
        window.Tawk_API.visitor = {
          name: userData.name,
          email: userData.email,
        };
        window.Tawk_API.setAttributes(
          {
            name: userData.name,
            email: userData.email,
          },
          function (error) {},
        );
      } else {
        window.Tawk_API.onLoad = () => {
          window.Tawk_API.visitor = {
            name: userData.name,
            email: userData.email,
          };
          window.Tawk_API.setAttributes(
            {
              name: userData.name,
              email: userData.email,
            },
            function (error) {},
          );
        };
      }
    }
  }, [allUserOrganisationData]);

  return <></>;
}
export default Tawk;
