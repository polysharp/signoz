import './AllAlertChannels.styles.scss';

import { PlusOutlined } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import getAll from 'api/channels/getAll';
import logEvent from 'api/common/logEvent';
import Spinner from 'components/Spinner';
import TextToolTip from 'components/TextToolTip';
import ROUTES from 'constants/routes';
import useComponentPermission from 'hooks/useComponentPermission';
import history from 'lib/history';
import { isUndefined } from 'lodash-es';
import { useAppContext } from 'providers/App/App';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { SuccessResponseV2 } from 'types/api';
import { Channels } from 'types/api/channels/getAll';
import APIError from 'types/api/error';

import AlertChannelsComponent from './AlertChannels';
import { Button, ButtonContainer, RightActionContainer } from './styles';

const { Paragraph } = Typography;

function AlertChannels(): JSX.Element {
	const { t } = useTranslation(['channels']);
	const { user } = useAppContext();
	const [addNewChannelPermission] = useComponentPermission(
		['add_new_channel'],
		user.role,
	);
	const onToggleHandler = useCallback(() => {
		history.push(ROUTES.CHANNELS_NEW);
	}, []);

	const { isLoading, data, error } = useQuery<
		SuccessResponseV2<Channels[]>,
		APIError
	>(['getChannels'], {
		queryFn: () => getAll(),
	});

	useEffect(() => {
		if (!isUndefined(data?.data)) {
			logEvent('Alert Channel: Channel list page visited', {
				number: data?.data?.length,
			});
		}
	}, [data?.data]);

	if (error) {
		return <Typography>{error.getErrorMessage()}</Typography>;
	}

	if (isLoading || isUndefined(data?.data)) {
		return <Spinner tip={t('loading_channels_message')} height="90vh" />;
	}

	return (
		<div className="alert-channels-container">
			<ButtonContainer>
				<Paragraph ellipsis type="secondary">
					{t('sending_channels_note')}
				</Paragraph>

				<RightActionContainer>
					<TextToolTip
						text={t('tooltip_notification_channels')}
						url="https://signoz.io/docs/userguide/alerts-management/#setting-notification-channel"
					/>

					<Tooltip
						title={
							!addNewChannelPermission
								? 'Ask an admin to create alert channel'
								: undefined
						}
					>
						<Button
							onClick={onToggleHandler}
							icon={<PlusOutlined />}
							disabled={!addNewChannelPermission}
						>
							{t('button_new_channel')}
						</Button>
					</Tooltip>
				</RightActionContainer>
			</ButtonContainer>

			<AlertChannelsComponent allChannels={data?.data || []} />
		</div>
	);
}

export default AlertChannels;
