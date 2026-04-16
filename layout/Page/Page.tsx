// @ts-nocheck
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { forwardRef, ReactNode } from 'react';

export interface IPageProps {
	children: ReactNode;
	container?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'fluid';
	className?: string;
}
const Page = forwardRef<HTMLDivElement, IPageProps>(
	({ children, className, container, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={classNames('page mt-3', className, {
					[`container${typeof container === 'string' ? `-${container}` : ''}`]: container,
				})}
				// eslint-disable-next-line react/jsx-props-no-spreading
				{...props}>
				{children}
			</div>
		);
	},
);
Page.displayName = 'Page';
Page.propTypes = {
	children: PropTypes.node.isRequired,
	// @ts-ignore
	container: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.oneOf([null, 'sm', 'md', 'lg', 'xl', 'xxl', 'fluid']),
	]),
	className: PropTypes.string,
};
Page.defaultProps = {
	container: 'xxl',
	className: undefined,
};

export default Page;
