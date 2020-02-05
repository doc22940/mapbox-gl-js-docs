import React from 'react';
import PropTypes from 'prop-types';
import GithubSlugger from 'github-slugger';
import createFormatters from 'documentation/src/output/util/formatters';
import LinkerStack from 'documentation/src/output/util/linker_stack';
import docs from '../components/api.json'; // eslint-disable-line
import ApiItem from '../components/api-item';
import Icon from '@mapbox/mr-ui/icon';

const linkerStack = new LinkerStack({}).namespaceResolver(docs, namespace => {
    const slugger = new GithubSlugger();
    const names = namespace.split('#');
    const nv = names.map((v) => `#${slugger.slug(v)}`).join('');
    return nv;
});

const formatters = createFormatters(linkerStack.link);

class ApiItemMember extends React.Component {
    constructor(props) {
        super(props);
        this.state = { disclosed: false };
        this.hashChange = this.hashChange.bind(this);
    }

    href = m => `#${m.namespace.toLowerCase()}`;

    render() {
        const member = this.props;
        return (
            <div className="border-b border--gray-light">
                <div
                    className="pt60"
                    style={{ marginTop: '-60px' }}
                    id={member.namespace.toLowerCase()}
                />
                <div>
                    <button
                        className="cursor-pointer toggle-sibling color-blue-on-hover w-full py18"
                        onClick={e => {
                            this.setState({ disclosed: !this.state.disclosed });
                            if (history.pushState) {
                                history.pushState(
                                    null,
                                    null,
                                    this.href(member)
                                );
                            } else {
                                location.hash = this.href(member);
                            }

                            e.preventDefault();
                        }}
                    >
                        <span className="txt-code truncate bg-white">
                            {member.name}
                        </span>
                        {member.kind === 'function' && (
                            <span
                                className="color-gray txt-code mr12"
                                dangerouslySetInnerHTML={{
                                    __html: `${formatters.parameters(
                                        member,
                                        true
                                    )}`
                                }}
                            />
                        )}
                        <div className="fr">
                            <Icon
                                size={30}
                                name={`${
                                    this.state.disclosed
                                        ? 'caret-down'
                                        : 'caret-right'
                                }`}
                                inline={true}
                            />
                        </div>
                    </button>
                </div>

                {this.state.disclosed && (
                    <div className="toggle-target bg-gray-faint round py18 px18 mb12">
                        <ApiItem
                            nested={true}
                            location={this.props.location}
                            {...member}
                        />
                    </div>
                )}
            </div>
        );
    }

    hashChange() {
        if (window.location.hash === this.href(this.props)) {
            this.setState({ disclosed: true });
        }
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.hashChange);
        this.hashChange();
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.hashChange);
    }
}

ApiItemMember.propTypes = {
    namespace: PropTypes.string,
    name: PropTypes.string,
    kind: PropTypes.string,
    location: PropTypes.object
};

export default ApiItemMember;
