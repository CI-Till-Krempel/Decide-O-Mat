import React from 'react';

const Footer = () => {
    const version = __APP_VERSION__;
    const commitHash = __COMMIT_HASH__;
    const envName = __APP_ENV__;

    const isProduction = envName === 'Production';

    return (
        <footer style={{
            textAlign: 'center',
            padding: '1rem',
            fontSize: '0.8rem',
            color: '#666',
            borderTop: '1px solid #eee',
            marginTop: '2rem'
        }}>
            <p>
                v{version}
                {!isProduction && (
                    <>
                        {' • '}
                        {envName || 'Local'}
                        {' • '}
                        {commitHash}
                    </>
                )}
            </p>
        </footer>
    );
};

export default Footer;
