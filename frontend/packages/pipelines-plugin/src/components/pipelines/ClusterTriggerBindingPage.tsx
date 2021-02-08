import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DetailsPageProps, DetailsPage } from '@console/internal/components/factory';
import { navFactory, Kebab } from '@console/internal/components/utils';
import { DetailsForKind } from '@console/internal/components/default-resource';
import { useTriggersBreadcrumbsFor } from './hooks';

const ClusterTriggerBindingPage: React.FC<DetailsPageProps> = (props) => {
  const { kindObj, match, kind } = props;
  const breadcrumbsFor = useTriggersBreadcrumbsFor(kindObj, match);
  const { t } = useTranslation();

  return (
    <DetailsPage
      {...props}
      menuActions={Kebab.factory.common}
      breadcrumbsFor={() => breadcrumbsFor}
      pages={[navFactory.details(DetailsForKind(kind, t)), navFactory.editYaml()]}
    />
  );
};

export default ClusterTriggerBindingPage;