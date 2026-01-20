import React from 'react';
import { Briefcase, MessageSquare, Store, Sparkles } from 'lucide-react';
import './styles/global.css';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <span className="logo-text">Learn.Botsfired.com</span>
          </div>
          <nav className="nav">
            <ul>
              <li><a href="#courses">Courses</a></li>
              <li><a href="#tools">Tools</a></li>
              <li><a href="#resources">Resources</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">Essential AI skills for everyone</h1>
            <p className="hero-subtitle">
              Learn all about AI & how to supercharge your work or business.
              We offer AI courses and tools that will help you build essential AI skills.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary">Get started</button>
              <button className="btn btn-outline">Explore tools</button>
            </div>
          </div>
        </section>

        <section id="courses" className="section">
          <div className="container">
            <h2 className="section-title">Build essential skills with AI training</h2>
            <div className="card-container">

              {/* Card 1 */}
              <div className="card">
                <div className="card-content">
                  <div className="card-header">
                    <div className="icon-box">
                      <Briefcase size={32} />
                      <Sparkles className="icon-sparkle" />
                    </div>
                    <div className="card-title-group">
                      <h3 className="card-title">Accelerate Your Job Search with AI</h3>
                      <p className="card-tag">COURSE</p>
                    </div>
                  </div>
                  <p className="card-description">
                    Learn how to leverage AI tools (like Gemini and NotebookLM) to accelerate your job search.
                    You’ll uncover your transferable skills, create a job search plan, manage your applications,
                    and practice for interviews.
                  </p>
                  <div className="card-footer">
                    <button className="btn-pill">Get started</button>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="card">
                <div className="card-content">
                  <div className="card-header">
                    <div className="icon-box">
                      <MessageSquare size={32} />
                      <Sparkles className="icon-sparkle" />
                    </div>
                    <div className="card-title-group">
                      <h3 className="card-title">Prompting Essentials</h3>
                      <p className="card-tag">COURSE</p>
                    </div>
                  </div>
                  <p className="card-description">
                    Learn how to write effective prompts to get the best results from AI.
                    Discover techniques for clear communication with AI models to boost your productivity.
                  </p>
                  <div className="card-footer">
                    <button className="btn-pill">Get started</button>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="card">
                <div className="card-content">
                  <div className="card-header">
                    <div className="icon-box">
                      <Store size={32} />
                      <Sparkles className="icon-sparkle" />
                    </div>
                    <div className="card-title-group">
                      <h3 className="card-title">AI for Small Businesses</h3>
                      <p className="card-tag">COURSE</p>
                    </div>
                  </div>
                  <p className="card-description">
                    Discover how AI can help your small business grow and save time.
                    Explore practical applications for marketing, operations, and customer service.
                  </p>
                  <div className="card-footer">
                    <button className="btn-pill">Get started</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Grow with Google. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
