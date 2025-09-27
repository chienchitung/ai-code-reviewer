import React, { useState, useCallback } from 'react';
import { analyzeCodeWithGemini } from '../../services/geminiService';
import ReviewResults from './ReviewResults';
import Spinner from '../ui/Spinner';
import { useLanguage } from '../../hooks/useLanguage';
import { ReviewIssue } from '../../types';
import IssueCard from './IssueCard';

const sampleCodeSnippets: Record<string, string> = {
  typescript: `// TODO: Use a proper interface instead of any[]
function findUser(users: any[], username: string) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].name === username) {
      return users[i];
    }
  }
  return null;
}`,
  javascript: `function processData(data) {
  var result = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].type == 'user') {
      result.push(data[i].name);
    }
  }
  return result;
}

function checkAccess(user) {
  // TODO: Implement proper access control
  if (user.role != 'admin') {
    console.log("Access denied");
  }
}

var urlParams = new URLSearchParams(window.location.search);
var username = urlParams.get('username');
document.getElementById('greeting').innerHTML = "Hello, " + username;
`,
  python: `import os

def get_user_permissions(user_id):
    # WARNING: This is vulnerable to SQL Injection
    query = "SELECT permissions FROM users WHERE id = " + user_id
    # This is also an example of command injection
    os.system(f"psql -c '{query}'")

# Inefficient string concatenation in a loop
def create_report(items):
    report_data = ""
    for item in items:
        report_data += str(item) + "\\n"
    return report_data
`,
  java: `public class UserManager {
    public String getUserInfo(String userId) {
        String query = "SELECT * FROM users WHERE userId = '" + userId + "'";
        // This is a major SQL injection vulnerability.
        // Also, it doesn't handle database connections properly (no closing).
        try {
            java.sql.ResultSet rs = executeQuery(query);
            if (rs.next()) {
                return "User: " + rs.getString("name");
            }
        } catch (Exception e) {
            // Bad practice: catching generic Exception and not logging it
        }
        return null;
    }

    // Dummy method to make the code snippet valid for analysis
    private java.sql.ResultSet executeQuery(String q) { return null; }
}`,
  csharp: `public class DataProcessor
{
    // Inefficient string concatenation in a loop. StringBuilder should be used.
    public string BuildString(string[] parts)
    {
        string result = "";
        for (int i = 0; i < parts.Length; i++)
        {
            result += parts[i];
        }
        return result;
    }

    public void ConnectToDatabase(string connectionString)
    {
        // Resource leak: SqlConnection is IDisposable and should be in a 'using' block.
        var connection = new System.Data.SqlClient.SqlConnection(connectionString);
        connection.Open();
        // Database work would happen here...
    }
}`,
  go: `package main

import (
	"fmt"
	"os"
)

// The error returned by os.Open is ignored, which is a common anti-pattern in Go.
func readFile(filename string) {
	f, _ := os.Open(filename) 
	// defer f.Close() is also missing, leading to a resource leak.
	fmt.Println(f.Name())
}
`,
  rust: `fn main() {
    let config: Option<String> = None;
    
    // Using unwrap() on a None value will cause the program to panic.
    // It's better to handle the Option gracefully with 'match' or 'if let'.
    let setting = config.unwrap();
    println!("Setting is {}", setting);

    let v = vec![1, 2, 3];
    // This will panic because the index is out of bounds.
    println!("The 10th element is {}", v[9]);
}`,
  html: `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <!-- Deprecated tags like <center> and <font> are used -->
    <center><b>Welcome!</b></center>
    <br>
    <font color="red">This is important text.</font>
    
    <!-- Missing 'alt' attribute for accessibility -->
    <img src="photo.jpg">
    
    <!-- Inline styles are bad practice -->
    <p style="font-size: 20px; color: blue;">This is a paragraph.</p>
</body>
</html>`,
  css: `/* Using IDs for styling can lead to specificity issues and is not scalable. */
#main-header {
  font-size: 24px;
  color: #333;
}

/* This selector is overly specific, making it inefficient and hard to override. */
div.container ul li a.active {
  font-weight: bold;
}

/* The universal selector can negatively impact performance. */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}`,
  sql: `SELECT * FROM products;

-- This query is vulnerable to SQL injection if 'search_term' comes from user input.
-- It should use parameterized queries.
SELECT product_name, price FROM products WHERE category = 'search_term';

-- This is a Cartesian join, which is likely unintentional and very inefficient
-- as it joins every customer with every order.
SELECT c.customer_name, o.order_date
FROM customers c, orders o;`,
  cpp: `#include <iostream>

void process_array(int size) {
    // A raw array of fixed size is used. If 'size' is > 10, a buffer overflow will occur.
    int arr[10];
    for (int i = 0; i < size; ++i) {
        arr[i] = i;
    }
}

int main() {
    // 'p' is allocated but never deallocated, causing a memory leak.
    int* p = new int;
    *p = 5;
    
    process_array(15); // This will cause a buffer overflow.
    return 0;
}`,
  php: `<?php
// This code is vulnerable to SQL Injection because it directly uses user input in a query.
$userId = $_GET['id'];
$query = "SELECT * FROM users WHERE id = " . $userId;
mysql_query($query); // The mysql_* functions are deprecated and insecure.

// This code is vulnerable to Cross-Site Scripting (XSS).
$name = $_GET['name'];
echo "Welcome, " . $name;
?>`,
};

interface CodeReviewerProps {
  addReview: (reviewData: { code: string; language: string; report: string; issues: ReviewIssue[] }) => void;
}


const CodeReviewer: React.FC<CodeReviewerProps> = ({ addReview }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [reviewResult, setReviewResult] = useState<{ report: string; issues: ReviewIssue[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisPerformed, setAnalysisPerformed] = useState(false);
  const { t, language: appLanguage } = useLanguage();

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysisPerformed(true);
    setReviewResult(null);
    try {
      const { report, issues } = await analyzeCodeWithGemini(code, language, appLanguage);
      setReviewResult({ report, issues });
      addReview({ code, language, report, issues });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setReviewResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [code, language, appLanguage, addReview]);

  const loadSampleCode = useCallback(() => {
    setCode(sampleCodeSnippets[language] || '');
    setAnalysisPerformed(false);
    setReviewResult(null);
    setError(null);
  }, [language]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('reviewerTitle')}</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
          <div>
            <button
              onClick={loadSampleCode}
              className="text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              {t('loadSample')}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('loadSampleDescription')}</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full sm:w-48 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="cpp">C++</option>
            <option value="php">PHP</option>
          </select>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t('pasteCode')}
          className="w-full h-80 p-4 font-mono text-sm bg-gray-100 dark:bg-gray-900 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none resize-y border border-gray-200 dark:border-gray-700"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !code.trim()}
            className="flex items-center justify-center px-6 py-2.5 bg-primary-600 text-white font-medium text-sm leading-tight uppercase rounded-md shadow-md hover:bg-primary-700 hover:shadow-lg focus:bg-primary-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-primary-800 active:shadow-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Spinner />}
            {isLoading ? t('loading') : t('analyzeCode')}
          </button>
        </div>
      </div>
      
      {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">{error}</div>}
      
      {analysisPerformed && !isLoading && !error && reviewResult && (
        <div className="space-y-6">
          <ReviewResults report={reviewResult.report} />
          {reviewResult.issues.length > 0 && (
            <div className="space-y-4">
              {reviewResult.issues.map((issue, index) => (
                <IssueCard key={index} issue={issue} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeReviewer;